package com.unimedvargina.UnimedVarginhaTi.modules.users.service;

import com.unimedvargina.UnimedVarginhaTi.modules.users.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public class AuthorizationService implements UserDetailsService {

    @Autowired
    private UserRepository Repository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException{
        return Repository.findByLogin(username);
    }
}
