package com.trexis.asaas;

import org.apache.camel.Exchange;
import org.apache.camel.Processor;
import org.springframework.security.core.context.SecurityContextHolder;

import com.backbase.portal.foundation.business.service.GroupBusinessService;
import com.backbase.portal.foundation.business.service.UserBusinessService;

import com.backbase.portal.foundation.domain.conceptual.UserPropertyDefinition;
import com.backbase.portal.foundation.domain.model.Group;
import com.backbase.portal.foundation.domain.model.Role;
import com.backbase.portal.foundation.domain.model.User;

public class AuthenticateUserProcessor implements Processor {
	
	private UserBusinessService userBusinessService;
	private GroupBusinessService groupBusinessService;
	
	public AuthenticateUserProcessor(UserBusinessService userBusinessService, GroupBusinessService groupBusinessService)
	{
		this.userBusinessService = userBusinessService;
		this.groupBusinessService = groupBusinessService;
	}
	
    public void process(Exchange exchange) throws Exception {

		if(SecurityContextHolder.getContext().getAuthentication()!=null){
			User bbuser = (User)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		
		}
    	

    }
    
}