package  com.trexis.portalserver;

import java.io.IOException;

import org.junit.Test;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.UsernamePasswordCredentials;
import org.apache.commons.httpclient.auth.AuthScope;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.codec.binary.Base64;

import static org.junit.Assert.fail;
import static org.junit.Assert.assertEquals;

public class InstallationValidationTestST {

    /**
     * Test if the portal is running and if the admin user is available.
     *
     * @throws IOException when caused by executeMethod
     */
    @Test
    public void basicValidation() throws IOException {
        // request url assuming default set up
        String url = "http://localhost:7777/portalserver/users/admin";

        // set up the getMethod
        GetMethod get = new GetMethod(url);
        get.setFollowRedirects(false);
        get.setRequestHeader("Authorization", "Basic " + new String(Base64.encodeBase64(("admin:admin").getBytes())));

        // Execute the request
        HttpClient adminClient = new HttpClient();
        int resCode = adminClient.executeMethod(get);

        // check if the http status code is 200 (OK)
        assertEquals("GET (" + url + ")", 200, resCode);
    }
}