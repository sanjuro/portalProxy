package com.trexis.asaas;

import org.apache.camel.Exchange;
import org.apache.camel.Processor;

import com.backbase.portal.foundation.domain.model.User;

import org.springframework.security.core.context.SecurityContextHolder;


public class CheckUserAuthenticationProcessor implements Processor {
	
    public void process(Exchange exchange) throws Exception {

		if(SecurityContextHolder.getContext().getAuthentication()!=null){
			User bbuser = (User)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		
		}
    	

    }
    
}
