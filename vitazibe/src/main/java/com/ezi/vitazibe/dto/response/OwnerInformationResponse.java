package com.ezi.vitazibe.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OwnerInformationResponse {
    private String ownerName;
    private String ownerEmail;
    private String ownerAvatar;
    private String ownerSub;
}
