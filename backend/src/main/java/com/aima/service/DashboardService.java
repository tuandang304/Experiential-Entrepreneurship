package com.aima.service;

import com.aima.dto.response.ApiResponse;
import com.aima.dto.response.DashboardSummaryResponse;

public interface DashboardService {

    /**
     * Toàn bộ số liệu tab "Bảng điều khiển" của user đang đăng nhập trong một lần gọi.
     *
     * @param email email lấy từ access token (định danh user, API-03/SEC-04)
     * @param days  độ dài khoảng xem của biểu đồ hiệu suất; FE gửi 7 hoặc 30, giá trị ngoài
     *              khoảng hợp lệ được kẹp lại thay vì báo lỗi
     */
    ApiResponse<DashboardSummaryResponse> getSummary(String email, int days);
}
