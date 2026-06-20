package com.aima.service.Impl;

import com.aima.dto.request.*;
import com.aima.dto.response.MeResponse;
import com.aima.service.EmailService;
import com.aima.service.OtpService;
import com.aima.service.RefreshTokenService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.aima.dto.response.ApiResponse;
import com.aima.dto.response.UserResponse;
import com.aima.entity.Role;
import com.aima.entity.User;
import com.aima.exception.AppException;
import com.aima.exception.ErrorCode;
import com.aima.mapper.UserMapper;
import com.aima.repository.RoleRepository;
import com.aima.repository.UserRepository;
import com.aima.service.UserService;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {
    UserRepository userRepository;
    RoleRepository roleRepository;

    EmailService emailService;
    OtpService otpService;
    RefreshTokenService refreshTokenService;

    UserMapper userMapper;

    PasswordEncoder passwordEncoder;

    static SecureRandom SECURE_RANDOM = new SecureRandom();
    static String GOOGLE_PLACEHOLDER = "GOOGLE_OAUTH2_USER";

    @Override
    public ApiResponse<UserResponse> registerUser(UserRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new AppException(ErrorCode.EMAIL_EXISTED);

        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        Role role = roleRepository.findByRoleName("USER")
                .orElseThrow(() -> new AppException(ErrorCode.DEFAULT_ROLE_NOT_FOUND));
        user.setRole(role);

        user.setStatus("ACTIVE");
        user.setProfileCompleted(true);
        User savedUser = userRepository.save(user);

        UserResponse userResponse = userMapper.toUserResponse(savedUser);
        return ApiResponse.success("Đăng ký tài khoản thành công", userResponse);
    }

    @Override
    public ApiResponse<List<UserResponse>> getAllUsers() {
        List<User> users = userRepository.findAll();

        if (users.isEmpty()) {
            throw new AppException(ErrorCode.USER_LIST_EMPTY);
        }

        List<UserResponse> userResponses = userMapper.toUserResponseList(users);
        return ApiResponse.success("Lấy danh sách người dùng thành công", userResponses);
    }

    @Override
    public ApiResponse<UserResponse> getUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        UserResponse userResponse = userMapper.toUserResponse(user);
        return ApiResponse.success("Lấy thông tin Người dùng thành công", userResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<MeResponse> getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        MeResponse meResponse = userMapper.toMeResponse(user);

        // Không lộ giá trị placeholder của Google ra FE; coi như chưa có.
        if (GOOGLE_PLACEHOLDER.equals(meResponse.getPhone())) {
            meResponse.setPhone(null);
        }
        meResponse.setProfileCompleted(isProfileComplete(user));

        return ApiResponse.success("Lấy thông tin người dùng hiện tại thành công", meResponse);
    }

    @Override
    public ApiResponse<MeResponse> updateCurrentUser(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateUserFromProfile(request, user);
        User saved = userRepository.save(user);

        MeResponse meResponse = userMapper.toMeResponse(saved);
        meResponse.setProfileCompleted(isProfileComplete(saved));

        return ApiResponse.success("Cập nhật thông tin cá nhân thành công", meResponse);
    }

    private boolean isProfileComplete(User user) {
        if (!"GOOGLE".equalsIgnoreCase(user.getProvider())) {
            return true;
        }
        return user.getFullName() != null && !user.getFullName().isBlank()
                && user.getPhone() != null && !user.getPhone().isBlank()
                && !GOOGLE_PLACEHOLDER.equals(user.getPhone())
                && user.getDateOfBirth() != null;
    }

    @Override
    public ApiResponse<String> forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.EMAIL_NOT_FOUND));

        String otpCode = generateOtp();

        // Lưu OTP (đã hash) trong Redis kèm TTL — thay cho bảng password_reset_tokens.
        otpService.storeOtp(user.getEmail(), otpCode);
        emailService.sendForgotPasswordOtpEmail(user.getEmail(), otpCode, user.getFullName());
        return ApiResponse.success("Mã OTP đã được gửi đến email của bạn", null);
    }

    @Override
    public ApiResponse<String> verifyOtp(VerifyOtpRequest request) {
        userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.EMAIL_NOT_FOUND));

        // Ném AppException nếu OTP sai/hết hạn/vượt số lần thử.
        otpService.verifyOtp(request.getEmail(), request.getOtpCode());
        otpService.markVerified(request.getEmail());

        return ApiResponse.success("Mã OTP hợp lệ");
    }

    @Override
    @Transactional
    public ApiResponse<String> resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.PASSWORDS_NOT_MATCH);
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.EMAIL_NOT_FOUND));

        // Chỉ cho đổi mật khẩu khi OTP đã được verify ở bước trước (cờ ngắn hạn trong Redis).
        if (!otpService.isVerified(request.getEmail())) {
            throw new AppException(ErrorCode.OTP_NOT_VERIFIED);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setLastPasswordChangeAt(LocalDateTime.now());
        userRepository.save(user);

        // OTP dùng một lần: xoá toàn bộ trạng thái OTP sau khi đổi thành công.
        otpService.invalidate(request.getEmail());

        // Vô hiệu hoá mọi phiên đăng nhập cũ sau khi đổi mật khẩu.
        refreshTokenService.revokeAllTokens(user.getId().toString());
        refreshTokenService.setLogoutTime(user.getEmail());

        return ApiResponse.success("Đặt lại mật khẩu thành công");
    }

    @Override
    public ApiResponse<UserResponse> completeProfile(String email, CompleteProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (Boolean.TRUE.equals(user.getProfileCompleted())) {
            throw new AppException(ErrorCode.PROFILE_ALREADY_COMPLETED);
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.PASSWORDS_NOT_MATCH);
        }
        if (passwordStrength(request.getPassword()) < MIN_PASSWORD_STRENGTH) {
            throw new AppException(ErrorCode.WEAK_PASSWORD);
        }

        userMapper.completeProfile(request, user);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setLastPasswordChangeAt(LocalDateTime.now());
        user.setProfileCompleted(true); // đánh dấu đã hoàn tất onboarding
        User savedUser = userRepository.save(user);

        // Confirmation email — never includes the plaintext password.
        try {
            emailService.sendAccountSetupSuccessEmail(
                    savedUser.getEmail(), savedUser.getFullName(), savedUser.getLastPasswordChangeAt());
        } catch (Exception e) {
            log.warn("Không thể gửi email xác nhận thiết lập tài khoản cho {}: {}", savedUser.getEmail(), e.getMessage());
        }

        return ApiResponse.success("Đã lưu thông tin, email xác nhận đã được gửi",
                userMapper.toUserResponse(savedUser));
    }

    private static final int MIN_PASSWORD_STRENGTH = 3;

    private int passwordStrength(String pw) {
        if (pw == null) return 0;
        int score = 0;
        if (pw.length() >= 8) score++;
        if (pw.matches(".*[A-Z].*")) score++;
        if (pw.matches(".*[a-z].*")) score++;
        if (pw.matches(".*\\d.*")) score++;
        if (pw.matches(".*[^A-Za-z0-9].*")) score++;
        return score;
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<UserResponse> getMyProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        UserResponse userResponse = userMapper.toUserResponse(user);

        return ApiResponse.success("Lấy hồ sơ cá nhân thành công", userResponse);
    }

    private String generateOtp() {
        int otp = 100000 + SECURE_RANDOM.nextInt(900000);
        return String.valueOf(otp);
    }
}
