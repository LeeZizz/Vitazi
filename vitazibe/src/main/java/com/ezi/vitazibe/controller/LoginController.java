package com.ezi.vitazibe.controller;


import com.ezi.vitazibe.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import com.ezi.vitazibe.dto.response.OwnerInformationResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;


@RestController
public class LoginController {
    @GetMapping("/ownerInformation")
    public ResponseEntity<ApiResponse<OwnerInformationResponse>> getOwnerInformation(@AuthenticationPrincipal OAuth2User oAuth2User) {
        if(oAuth2User == null) {
            ApiResponse<OwnerInformationResponse> apiResponse = ApiResponse.<OwnerInformationResponse>builder()
                    .message("Unauthorized")
                    .build();
            return ResponseEntity.status(401).build();
        }
        String ownerName = oAuth2User.getAttribute("name");
        String owernEmail = oAuth2User.getAttribute("email");
        String ownerAvatar = oAuth2User.getAttribute("picture");
        String ownerSub = oAuth2User.getAttribute("sub");
        if (ownerSub == null) {
            ownerSub = oAuth2User.getAttribute("id");
        }

        if(ownerAvatar == null || ownerAvatar.isEmpty()) {
//            Object pictureObj = oAuth2User.getAttribute("picture");
//            if(pictureObj instanceof Map){
//                ownerAvatar = ((java.util.Map<String, Object>) pictureObj)
//                        .get("data").toString();
//            }
            ownerAvatar = "https://www.flaticon.com/free-icon/dinosaur_4681809"; // or = "https://lh3.googleusercontent.com/a/ACg8ocKp36O3gzhAXEL7wPs1G-loJR5oV2vm_NQgKVDJuQFrpK5ZNsO5=s96-c"
        }
        OwnerInformationResponse ownerInformationResponse = new OwnerInformationResponse(ownerName, owernEmail, ownerAvatar, ownerSub);
        ApiResponse<OwnerInformationResponse> response = ApiResponse.<OwnerInformationResponse>builder()
                .message("Success")
                .result(ownerInformationResponse)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/userinfo")
    public Principal user(Principal principal) {
        return principal;
    }

    @RequestMapping("/")
    public String home() {
        return "Welcome to Vitazi";
    }
}
