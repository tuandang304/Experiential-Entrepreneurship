// Validation cho thông tin cá nhân (onboarding CompleteProfilePage). Mirror các rule
// của backend CompleteProfileRequest. Gom về một nguồn để tái dùng/đồng bộ.

// SĐT VN: 10-11 chữ số, bắt đầu bằng 0 (là tập con của regex backend ^[0-9]{10,11}$).
export const phoneOk = (v: string): boolean => /^0\d{9,10}$/.test(v.trim());

export function validateStep1(fullName: string, phone: string, dob: string) {
  const e: { fullName?: string; phone?: string; dob?: string } = {};
  if (!fullName.trim()) e.fullName = "Vui lòng nhập họ và tên";
  if (!phone.trim()) e.phone = "Vui lòng nhập số điện thoại";
  else if (!phoneOk(phone)) e.phone = "Số điện thoại không hợp lệ (VD: 0901234567)";
  if (!dob) e.dob = "Vui lòng chọn ngày sinh";
  else if (dob > new Date().toISOString().split("T")[0]) e.dob = "Ngày sinh không được ở tương lai";
  return e;
}
