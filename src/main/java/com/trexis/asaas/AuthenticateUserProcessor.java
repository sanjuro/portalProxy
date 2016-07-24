package com.trexis.asaas;

import org.apache.camel.Exchange;
import org.apache.camel.Processor;
import org.springframework.security.core.context.SecurityContextHolder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.backbase.portal.foundation.business.service.GroupBusinessService;
import com.backbase.portal.foundation.business.service.UserBusinessService;
import com.backbase.portal.foundation.commons.exceptions.FoundationDataException;
import com.backbase.portal.foundation.commons.exceptions.FoundationReadOnlyException;
import com.backbase.portal.foundation.commons.exceptions.FoundationRuntimeException;
import com.backbase.portal.foundation.commons.exceptions.ItemAlreadyExistsException;
import com.backbase.portal.foundation.commons.exceptions.ItemNotFoundException;

import com.backbase.portal.foundation.domain.conceptual.UserPropertyDefinition;
import com.backbase.portal.foundation.domain.model.User;
import com.keybank.cxp.security.BackbasePreAuthenticationProvider;

public class AuthenticateUserProcessor implements Processor {
	
	private static Logger LOG = LoggerFactory.getLogger(AuthenticateUserProcessor.class);
	private UserBusinessService userBusinessService;
	
	public AuthenticateUserProcessor(UserBusinessService userBusinessService)
	{
		this.userBusinessService = userBusinessService;
	}
	
    public void process(Exchange exchange) throws Exception {

		if(SecurityContextHolder.getContext().getAuthentication()!=null){
			User bbuser = (User)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		
			String userName = exchange.getIn().getHeader("username").toString();
			String password = exchange.getIn().getHeader("password").toString();
			
			setProperty(bbuser, "bob_username", userName);
			setProperty(bbuser, "bob_password", password);
			user = updateUser(bbuser, userName, password, SecurityContextHolder.getContext().getAuthentication());
		}
    	
    }
    
    private void setProperty(User user, String propertyName, String propertyValue) {
		// Create property definition for the email field.
		UserPropertyDefinition newProperty = new UserPropertyDefinition(propertyName, new StringPropertyValue(propertyValue));
		// Add the property definitions to the user object
		// Don't override the existing properties
		user.getPropertyDefinitions().put(propertyName, newProperty);
    }
    
    private User updateUser(User user, String userName, String password, DirContextOperations ctx)
    {
        // LOG.info("Registering user {} with groups {}", userName, groups);

        try {
            userBusinessService.updateUser(user);
        } catch (FoundationDataException e1) {
            throw new FoundationRuntimeException(e1);
        } catch (ItemNotFoundException e1) {
            throw new FoundationRuntimeException(e1);
        } catch (ItemAlreadyExistsException e1) {
            throw new FoundationRuntimeException(e1);
        }
        return user;
    }
    
}