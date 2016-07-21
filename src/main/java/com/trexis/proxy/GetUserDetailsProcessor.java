package com.trexis.proxy;

import org.apache.camel.Exchange;
import org.apache.camel.Processor;

import com.backbase.portal.foundation.business.service.UserBusinessService;
import com.backbase.portal.foundation.domain.model.Group;
import com.backbase.portal.foundation.domain.model.User;
import com.backbase.portal.foundation.commons.exceptions.ItemNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;


public class GetUserDetailsProcessor implements Processor {
	
//	private static final Logger LOG = LoggerFactory.getLogger(null);
	
	@Autowired
	private UserBusinessService userBusinessService;
	
    public void process(Exchange exchange) throws Exception {

    	User user =  (User) retrieveUserFromContext();
    	

    }
    
    protected UserDetails retrieveUserFromContext()
            throws AuthenticationException {

    	SecurityContext context = SecurityContextHolder.getContext();
    	String userName = context.getAuthentication().getName();
    	
    	User user = null;
        try {
        	
        	user = userBusinessService.getUser(userName);
//        	LOG.info("Only performing authentication. Returning user: {} defined in portal manager",
//        			user.getUsername());
        	
            return user;
            
        } catch (ItemNotFoundException e) {
            throw new AuthenticationServiceException(
            		"User is not allowed to login because the user does not exist in the portal database. ");
        } 

}
}
