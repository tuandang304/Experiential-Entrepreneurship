package com.aima.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(name = "PageResponse", description = "Khung dữ liệu phân trang dùng chung cho mọi danh sách (đặt trong ApiResponse.result).")
public class PageResponse<T> {

    @Schema(description = "Danh sách bản ghi của trang hiện tại.")
    List<T> content;

    @Schema(description = "Số thứ tự trang hiện tại (bắt đầu từ 0).", example = "0")
    int page;

    @Schema(description = "Số bản ghi tối đa trên một trang.", example = "10")
    int size;

    @Schema(description = "Tổng số bản ghi của toàn bộ kết quả.", example = "57")
    long totalElements;

    @Schema(description = "Tổng số trang.", example = "6")
    int totalPages;

    @Schema(description = "true nếu đây là trang cuối cùng.", example = "false")
    boolean last;

    public static <E, T> PageResponse<T> from(Page<E> page, List<T> content) {
        return PageResponse.<T>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
