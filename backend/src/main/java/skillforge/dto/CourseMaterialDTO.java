package com.skillforge.dto;

import com.skillforge.model.CourseMaterial;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseMaterialDTO {
    private String id;
    private String title;
    private String type;
    private String contentUrl;
    private String textContent;
    private Integer orderIndex;
    private String courseId;

    public static CourseMaterialDTO fromEntity(CourseMaterial material) {
        CourseMaterialDTO dto = new CourseMaterialDTO();
        dto.setId(material.getId());
        dto.setTitle(material.getTitle());
        dto.setType(material.getType().name());
        dto.setContentUrl(material.getContentUrl());
        dto.setTextContent(material.getTextContent());
        dto.setOrderIndex(material.getOrderIndex());
        dto.setCourseId(material.getCourseId());
        return dto;
    }
}
