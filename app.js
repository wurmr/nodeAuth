'use strict';

var express = require('express'),
	https = require('https'),
	fs = require('fs');

var passport = require('passport'),
	wsfedsaml2 = require('passport-azure-ad').WsfedStrategy;

var app = express();

var config = {
	realm: 'https://localhost:3000/',
	homeRealm: 'http://adfs.intertech.com/adfs/services/trust',
	identityMetadata: 'https://adfs.intertech.com/FederationMetadata/2007-06/FederationMetadata.xml',
	identityProviderUrl: 'https://adfs.intertech.com/adfs/ls',
	logoutUrl: 'http://localhost:3000/logout'
	//wreply: 'http://localhost:3000/',
	//cert: ''
	//cert: 'MIIC4DCCAcigAwIBAgIQG75dsYww5LlCVc29T7ctjDANBgkqhkiG9w0BAQsFADAsMSowKAYDVQQDEyFBREZTIFNpZ25pbmcgLSBhZGZzLmludGVydGVjaC5jb20wHhcNMTMxMTE5MTcxMjE4WhcNMTQxMTE5MTcxMjE4WjAsMSowKAYDVQQDEyFBREZTIFNpZ25pbmcgLSBhZGZzLmludGVydGVjaC5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCpf87WIfEIlTenXmG3dvoyqD0zIWX2loLuNvi1leq9KMHTY8s3G6sbso+xUa5d6g4pgAbk9bRAa8PlZvwjTeYVzL5A/Kb5iZn9olsn5AaltDmgQbsCzDYqtjKN9RqSyg7RY/oWu63PDfmE866LlDoXymA1+iVLTEj+qHnasyBbvtVIGGYxUSlTdLFjxcfdwtBeC6azGPtc3Unv5TmlYazM1GQr5kmIxUyKezMmKtwVfSoSLyRK8ey7Chz4BgvZ8PNkF5cETpsx8Pl6Cnz1XaexDBN5BRMivLX9rxq6dlXy8ZeuGLSHLPLObOwGalPg5ESIVbZW2PgHaiPq6SKljuvLAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAKeQHP9/Xaqg/nk7jxM+NxvnCLAhHIpV0yEaNTq4kbnPkXss5N3ypm9AxJvTwSWR9ANcOFZXHftalcNWlJ8Yn/W3yrMpSRrsWXHHEqDXHL6SDPNH4PH3sxiS6kYxW/pPViiqw+TACR/dUBkFg6T0InslZGEOZjxeC7ilo+0yKrLiccW2NdaReprnRmxYGwA/mTL+Jq1PA09fRqOwqCUN4Pbd+RhzYPKcQmocCqyFaM2DMT5HWLHOqzRDHuhGSkjx8GN4PTFtdrN3dQ4ci+SUPqL/2Ihn/TFgzLeJEYF8cvy9Q/Tona9DUPODDmH3RYQ1gH69NpyBx27KT7c/wVZPhPg='
};

/* https://adfs.intertech.com/adfs/ls/?
--wa=wsignin1.0
--&wtrealm=https%3a%2f%2ftime.intertech.com%2f
&wctx=rm%3d0%26id%3dpassive%26ru%3d%252fReport
&wct=2014-05-06T15%3a14%3a27Z
&wauth=urn%3afederation%3aauthentication%3awindows
--&whr=http%3a%2f%2fadfs.intertech.com%2fadfs%2fservices%2ftrust
&wreply=https%3a%2f%2ftime.intertech.com%2f
*/

/*
https://adfs.intertech.com/adfs/ls/?
wtrealm=http%3A%2F%2Flocalhost%3A3000%2F
&wa=wsignin1.0
&whr=http%3A%2F%2Fadfs.intertech.com%2Fadfs%2Fservices%2Ftrust
*/

/*
https://adfs.intertech.com/adfs/ls/
?wtrealm=http%3A%2F%2Flocalhost%3A3000%2F
&wa=wsignin1.0
&whr=http%3A%2F%2Fadfs.intertech.com%2Fadfs%2Fservices%2Ftrust
&wreply=http%3A%2F%2Flocalhost%3A3000%2F

https://adfs.intertech.com/adfs/ls/?wtrealm=http%3A%2F%2Flocalhost%3A3000%2F&wa=wsignin1.0&whr=http%3A%2F%2Fadfs.intertech.com%2Fadfs%2Fservices%2Ftrust&wreply=http%3A%2F%2Flocalhost%3A3000%2Fwauth=urn%3Aietf%3Arfc%3A2246
https://adfs.intertech.com/adfs/ls/?wa=wsignin1.0&wtrealm=https://time.intertech.com/&wreply=https://time.intertech.com/

working:
https://adfs.intertech.com/adfs/ls/?wa=wsignin1.0&wtrealm=https%3a%2f%2ftime.intertech.com%2f&wctx=rm%3d0%26id%3dpassive%26ru%3d%252fReport&wct=2014-05-06T15%3a14%3a27Z&wauth=urn%3afederation%3aauthentication%3awindows&whr=http%3a%2f%2fadfs.intertech.com%2fadfs%2fservices%2ftrust&wreply=https%3a%2f%2ftime.intertech.com%2f
https://adfs.intertech.com/adfs/ls/?wa=wsignin1.0&wtrealm=https://time.intertech.com/&id=passive&ru=%2fReport&wct=2014-05-06T15:14:27Z&wauth=urn:federation:authentication:windows&whr=http://adfs.intertech.com/adfs/services/trust&wreply=https://time.intertech.com/
https://adfs.intertech.com/adfs/ls/?wa=wsignin1.0&wtrealm=https://time.intertech.com/&id=passive&ru=%2fReport&wct=2014-05-06T15:14:27Z&whr=http://adfs.intertech.com/adfs/services/trust&wreply=https://time.intertech.com/
https://adfs.intertech.com/adfs/ls/?wa=wsignin1.0&wtrealm=https://time.intertech.com/&id=passive&ru=%2fReport&whr=http://adfs.intertech.com/adfs/services/trust&wreply=https://time.intertech.com/
https://adfs.intertech.com/adfs/ls/?wa=wsignin1.0&wtrealm=https://time.intertech.com/&whr=http://adfs.intertech.com/adfs/services/trust&wreply=https://time.intertech.com/
https://adfs.intertech.com/adfs/ls/?wa=wsignin1.0&wtrealm=https://time.intertech.com/
https://adfs.intertech.com/adfs/ls/?wa=wsignin1.0&wreply=https://time.intertech.com/
https://adfs.intertech.com/adfs/ls/?wa=wsignin1.0&wreply=https://time.intertech.com/&wuath=urn:oasis:names:tc:SAML:1.0:am:password
*/

var wsfedStrategy = new wsfedsaml2(config, function(profile, done) {
	if (!profile.email) {
		done(new Error("No email found"));
		return;
	}
	// validate the user here
	done(null, profile);
});
passport.use(wsfedStrategy);

app.use(passport.initialize());

// send the user to WAAD to authenticate    
app.get('/', passport.authenticate('wsfed-saml2', {
	failureRedirect: '/nay',
	failureFlash: true
}), function(req, res) {
	res.send('in');
});

// callback from WAAD with a token
app.post('/login/callback', passport.authenticate('wsfed-saml2', {
	failureRedirect: '/yay',
	successRedirect: '/nay',
	failureFlash: true
}));


app.get('/logout', function(req, res) {
	// clear the passport session cookies
	req.logout();

	// We need to redirect the user to the WSFED logout endpoint so the
	// auth token will be revoked
	wsfedStrategy.logout({}, function(err, url) {
		if (err) {
			res.redirect('/');
		} else {
			res.redirect(url);
		}
	});
});

app.get('/yay', function(req, res) {
	res.send('Yay');
});

app.get('/nay', function(req, res) {
	res.send('Nope');
});

var serverOptions = {
	key: fs.readFileSync('./server.key'),
	cert: fs.readFileSync('./server.crt')
};

var server = https.createServer(serverOptions, app);

server.listen(3000, '127.0.0.1', function() {
	console.log('Listening on port %d', server.address().port);
});