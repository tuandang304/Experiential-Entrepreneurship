package com.aima.controller;

import com.aima.dto.request.ForgotPasswordRequest;
import com.aima.dto.request.ResetPasswordRequest;
import com.aima.dto.request.UpdateProfileRequest;
import com.aima.dto.request.VerifyOtpRequest;
import com.aima.dto.response.MeResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.aima.config.swagger.SwaggerExamples;
import com.aima.dto.request.UserRegisterRequest;
import com.aima.dto.response.UserResponse;
import com.aima.service.UserService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Users", description = "User registration and account management.")
public class UserController {
    UserService userService;

    @PostMapping("/register")
    @Operation(
            summary = "Register a new user account",
            description = "Creates a new user after validating field constraints and email uniqueness. " +
                    "The username is set to the email and the role defaults to USER."
    )
    @SecurityRequirements({})
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            content = @Content(schema = @Schema(implementation = UserRegisterRequest.class),
                    examples = @ExampleObject(value = SwaggerExamples.REGISTER_REQUEST)))
    @ApiResponse(responseCode = "200", description = "User registered successfully.",
            content = @Content(schema = @Schema(implementation = com.aima.dto.response.ApiResponse.class),
                    examples = @ExampleObject(value = SwaggerExamples.REGISTER_RESPONSE)))
    public com.aima.dto.response.ApiResponse<UserResponse> register(@Valid @RequestBody UserRegisterRequest request) {
        return userService.registerUser(request);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "List all users",
            description = "Returns every user account. Restricted to ADMIN."
    )
    @ApiResponse(responseCode = "200", description = "User list returned.")
    public com.aima.dto.response.ApiResponse<List<UserResponse>> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Get a user by id",
            description = "Looks up a single user by UUID. Restricted to ADMIN."
    )
    @ApiResponse(responseCode = "200", description = "User returned.")
    public com.aima.dto.response.ApiResponse<UserResponse> getUserById(@PathVariable UUID userId) {
        return userService.getUserById(userId);
    }

    @GetMapping("/me")
    @Operation(
            summary = "Get the currently authenticated user",
            description = "Returns the identity (id, email, role) of the user resolved from the JWT in the " +
                    "Security Context. Requires a valid access token; the user is never passed as a parameter."
    )
    @ApiResponse(responseCode = "200", description = "Current user returned.")
    public com.aima.dto.response.ApiResponse<MeResponse> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        return userService.getCurrentUser(userDetails.getUsername());
    }

    @PutMapping("/me")
    @Operation(
            summary = "Update the current user's profile",
            description = "Saves fullName, phone and dateOfBirth for the authenticated user. Used both by the " +
                    "complete-profile screen after a first Google login and by the regular profile editor."
    )
    @ApiResponse(responseCode = "200", description = "Profile updated; current user returned.")
    public com.aima.dto.response.ApiResponse<MeResponse> updateCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateCurrentUser(userDetails.getUsername(), request);
    }

    //reset password
    @PostMapping("/forgot-password")
    @SecurityRequirements({})
    @Operation(
            summary = "Request a password-reset OTP",
            description = "Validates the email exists, invalidates any previous reset tokens, generates a 6-digit OTP " +
                    "valid for 1 minute 30 seconds, and emails it to the user. Returns 404 if the email is not registered."
    )
    @ApiResponse(responseCode = "200", description = "OTP sent to the user's email.")
    @ApiResponse(responseCode = "404", description = "Email not found.")
    public com.aima.dto.response.ApiResponse<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return userService.forgotPassword(request);
    }

    @PostMapping("/verify-otp")
    @SecurityRequirements({})
    @Operation(
            summary = "Verify a password-reset OTP",
            description = "Checks that the OTP matches the email, has not been used, and has not expired. " +
                    "Does not consume the OTP — it is consumed only on POST /users/reset-password."
    )
    @ApiResponse(responseCode = "200", description = "OTP is valid.")
    @ApiResponse(responseCode = "400", description = "OTP is invalid, used, or expired.")
    public com.aima.dto.response.ApiResponse<String> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return userService.verifyOtp(request);
    }

    @PostMapping("/reset-password")
    @SecurityRequirements({})
    @Operation(
            summary = "Reset password with a verified OTP",
            description = "Re-validates the OTP, ensures newPassword equals confirmPassword, updates the user's password " +
                    "(BCrypt), and marks the OTP as used so it cannot be reused."
    )
    @ApiResponse(responseCode = "200", description = "Password reset successfully.")
    @ApiResponse(responseCode = "400", description = "OTP invalid/expired/used or passwords do not match.")
    public com.aima.dto.response.ApiResponse<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return userService.resetPassword(request);
    }
}
