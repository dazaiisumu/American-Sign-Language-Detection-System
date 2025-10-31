package com.asl.backend.repository;

import com.asl.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Add this method so Spring Data JPA can generate the query automatically
    Optional<User> findByEmail(String email);

}
