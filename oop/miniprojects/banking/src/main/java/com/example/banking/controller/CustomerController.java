package com.example.banking.controller;

import com.example.banking.model.Customer;
import com.example.banking.repository.CustomerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for customer management.
 * Mirrors the CustomerController class from the OOP diagram:
 *   - customerList: ArrayList
 *   - addCustomer(), editCustomer(), removeCustomer(), searchCustomer()
 *
 * Relationship: CustomerController DEPENDS ON Customer (manages Customer objects)
 */
@RestController
@RequestMapping("/customers")
public class CustomerController {

    // Mirrors the diagram's "CustomerList: ArrayList"
    private final List<Customer> customerList = new ArrayList<>();

    private final CustomerRepository customerRepo;

    public CustomerController(CustomerRepository customerRepo) {
        this.customerRepo = customerRepo;
    }

    // ── OOP diagram operations ─────────────────────────────────────────────────

    public void addCustomer(Customer customer) {
        customerRepo.save(customer);
        customerList.add(customer);
    }

    public void editCustomer(int id, Customer updated) {
        customerRepo.findById(id).ifPresent(c -> {
            c.setName(updated.getName());
            c.setPhoneNo(updated.getPhoneNo());
            c.setAddress(updated.getAddress());
            customerRepo.save(c);
        });
    }

    public void removeCustomer(int id) {
        customerRepo.deleteById(id);
        customerList.removeIf(c -> c.getId() == id);
    }

    public Customer searchCustomer(String name) {
        return customerRepo.findAll().stream()
                .filter(c -> c.getName() != null && c.getName().equalsIgnoreCase(name))
                .findFirst().orElse(null);
    }

    // ── REST endpoints ─────────────────────────────────────────────────────────

    /** GET /customers/me — current user's profile. */
    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        return customerRepo.findByEmail(auth.getName())
                .map(c -> ResponseEntity.ok(Map.of(
                        "id", c.getId(),
                        "name", c.getName() != null ? c.getName() : "",
                        "email", c.getEmail(),
                        "phoneNo", c.getPhoneNo() != null ? c.getPhoneNo() : "",
                        "address", c.getAddress() != null ? c.getAddress() : "",
                        "cardNo", c.getCardNo() != null ? c.getCardNo() : "")))
                .orElse(ResponseEntity.status(404).build());
    }

    /** PUT /customers/me — update current user's profile. */
    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@RequestBody Map<String, String> body, Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        return customerRepo.findByEmail(auth.getName())
                .map(c -> {
                    if (body.containsKey("name")) c.setName(body.get("name"));
                    if (body.containsKey("phoneNo")) c.setPhoneNo(body.get("phoneNo"));
                    if (body.containsKey("address")) c.setAddress(body.get("address"));
                    customerRepo.save(c);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.status(404).build());
    }
}
