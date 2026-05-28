package com.example.banking.repository;

import com.example.banking.model.LoginSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LoginSessionRepository extends JpaRepository<LoginSession, Long> {
    List<LoginSession> findByCustomerIdOrderByLoginTimeDesc(Long customerId);
}
