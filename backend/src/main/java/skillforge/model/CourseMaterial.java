package com.skillforge.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "course_materials")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseMaterial {

    @Id
    private String id;

    private String title;
    private MaterialType type;
    private String contentUrl;
    private String textContent;
    private Integer orderIndex;
    private String courseId;

    public enum MaterialType {
        PDF, VIDEO, TEXT
    }
}
