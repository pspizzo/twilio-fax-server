# Twilio Fax Server
NodeJS fax server using Twilio for sending and receiving faxes digitally. No fax machine required! Tested on a Raspberry Pi 3.


## Features
Want to send a fax? Use the web interface to upload a file and send it to any phone number you desire.

Need to receive a fax? Not only will you get your fax, but it will be stored in a POP3 Maildir format so you can access it from locally networked computers. (Hey, it's what I needed...)


## Requirements
* You need a computer. I used a Raspberry Pi 3, which works great and is inexpensive!
* An Internet connection.
* You need to configure inbound network address translation to your computer:
** Internet -> TCP-443 should map to your computer's TCP-3297 (used for sending/receiving Twilio faxes)
** Internet -> TCP-80 should map to your computer's TCP-3298 (used for Let's Encrypt certificate validation)
* Your local network should be able to reach your computer's TCP-443 directly (for the web interface to send faxes).
* A Twilio account with a Programmable Fax phone number.


## Installation

### Update NPM
On a Raspberry Pi, you might need to update the version of NPM:

    npm install -g npm@latest
    
You may need to log out and back in after the package is successfully updated.


### Download and build the code
Once you have the code downloaded:

    npm install
    npm run build


### Install a certificate
Search the web for full, up-to-date instructions. But I recommend using `certbot` to handle your certificate. You can use the <INSTALL_DIR>/receive-fax/public directory to store any Let's Encrypt challenge files, or as the "WEBROOT" argument in the certbot command below.

IMPORTANT: self-signed certificates will not work with Twilio. You must use a valid certificate.

The certificate files required by this application:
* <INSTALL_ROOT>/certificate.pem - The public certificate
* <INSTALL_ROOT>/privateKey.pem - The server's private key

To install certificates using certbot:

    certbot certonly --webroot -w <YOUR_WEBROOT_PATH> -d <YOUR_FQDN>
    ln -s /etc/letsencrypt/lib/<YOUR_FQDN>/fullchain.pem <INSTALL_DIR>/certificate.pem
    ln -s /etc/letsencrypt/lib/<YOUR_FQDN>/privkey.pem <INSTALL_DIR>/privateKey.pem


### Configure web users
You need to configure usernames and passwords for web access. Copy the <INSTALL_DIR>/config/web-logins.json.example to <INSTALL_DIR/config/web-logins.json and add the user credentials you want to allow.
* NOTE - plaintext passwords are not very secure and this could be improved.


### Setup your start.sh script
Copy the <INSTALL_ROOT>/start.sh.example to <INSTALL_ROOT>/start.sh and edit the file, filling in the blank variables.
* MAILDIR_ROOT_DIR - the top-level Maildir directory. New faxes will be stored as $MAILDIR_ROOT_DIR/new/<mail-filename>
* PUBLIC_HOSTNAME - The FQDN where your server can be reached. Required when sending a fax through Twilio (the initial request to Twilio only includes a URL, so Twilio will need to contact your server as a separate communication request).
* TWILIO_SID - Your Twilio authentication SID
* TWILIO_TOKEN - Your Twilio authentication token
* TWILIO_FAX_NUMBER - A phone number you have registered with Twilio that is used to send faxes
* INBOUND_AUTH_USER (optional) - Username to secure the media URL of your outbound faxes while waiting for Twilio to retrieve them
* INBOUND_AUTH_PASS (optional) - Password to secure the media URL of your outbound faxes while waiting for Twilio to retrieve them


Once you have your start.sh file ready, launch your server:

    sh start.sh


### Test your server!
Now you should be able to connect to your local web server: https://<your-ip-address>


### Configure POP3
In order to access the received faxes, you will need to setup a POP3 server and a local user.

    sudo apt-get install courier-pop
    sudo useradd -m -s /bin/nologin myfaxuser
    sudo passwd myfaxuser

After you set the user's password, you can test the POP3 access (I indented server responses for clarity):

    openssl s_client -connect localhost:995       # Connects to your POP3 server
    user myfaxuser
        +OK Password required
    pass ABCD1234
        +OK logged in
    STAT
        +OK 1 463
    quit


### Start the server when your computer boots
Lastly, if you want the application to start at boot, add the working start.sh script to /etc/rc.local.
 * Example /etc/rc.local entry:  `(cd /dir/to/vfh-twilio-fax ; ./start.sh >/logdir/vfh-twilio-fax.log 2>&1 & )`


## How It Works

### Sending a fax

1. After you entered a destination phone number and fax PDF file to send, you press the Submit button in the web interface.
2. The fax server receives the file and stores it on the local file system.
3. The server contacts Twilio with a "send fax" request, providing a Media URL where Twilio can get the PDF file to send.
4. Twilio makes a new HTTPS request to the fax server for the PDF file.
5. Now that Twilio has the PDF file to send, it tries to dial the destination phone number and send the file to the remote fax machine.
6. Meanwhile, the web interface polls the fax server for the status of the fax, which is essentially a proxied call to Twilio's "Fax Status" REST API endpoint.
7. Once Twilio reports a final success or failure status, the web interface updates the UI to show the final result.


### Receiving a fax

1. Someone dials your registered Twilio fax number.
2. Twilio sends a request to your fax server with the relevant meta-information (phone number).
3. The fax server responds with a TwiML response to receive the fax and send it to our fax server.
4. The sent fax is stored in Twilio (in memory, to improve security - per our Twiml instructions).
5. Twilio then contacts our fax server with the PDF file to send.
6. The local server receives the PDF file and stores it on disk.
7. The fax server responds with a "200/OK" response to Twilio, ending the connection.
8. The server encodes the saved file using Base64 and creates a Maildir entry.
9. Now a POP3 client can download and view the fax file as if it were an email, with the PDF as an attachment.
