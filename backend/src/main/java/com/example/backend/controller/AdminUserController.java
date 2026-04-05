package com.example.backend.controller;

import com.example.backend.dto.AdminUserDto;
import com.example.backend.dto.UpdateUserRoleRequest;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<AdminUserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsersForAdmin());
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<AdminUserDto> toggleUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleUserStatus(id));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<AdminUserDto> changeRole(@PathVariable Long id, @RequestBody UpdateUserRoleRequest request) {
        return ResponseEntity.ok(userService.changeUserRole(id, request.getRole()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<AdminUserDto> deleteUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.deleteUser(id));
    }
}
