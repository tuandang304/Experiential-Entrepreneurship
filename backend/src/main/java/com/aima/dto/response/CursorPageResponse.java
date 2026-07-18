package com.aima.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Trang keyset/cursor (KHÔNG offset) cho danh sách lớn — {@code nextCursor} truyền lại
 * nguyên văn để lấy trang kế; null = hết dữ liệu. Cursor là chuỗi mờ (FE không parse).
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CursorPageResponse<T> {

    List<T> items;

    String nextCursor;
}
