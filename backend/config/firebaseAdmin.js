const admin = require('firebase-admin');
// const serviceAccount = {
//   "type": "service_account",
//   "project_id": "task-manegement-app-919e7",
//   "private_key_id": "a82cb849c75bffdcbdce2d933f248c0a232fcc79",
//   "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDEDYMX8B0VRl76\nkuDESIOADYLxcQViFefO2J0PTkTWBJm33AFxd7guT6d2u42if07W1UEwAjOtvrN0\nIIEkNSwYV13fJVfYXai54bT6yVCtr94bqa5evGMLAoUpodu7qi54PNygDnHkSXVn\nvHgbyj+G+gvUBIAMMve/sduUcReS8W5GgIJ5sIjpwPGPKhobcEoF0u5XEOM4j4mU\n+Orv1+4pZSl4Ku60aQqnKRDnQlQStBqo9qZINJOnGKnxqDJIoJEEnXHsGotrZFDk\nmJsPd1BTjpdAaP997ZK+800JyzBJZoeiI9phTlhiqyAyuJnFbbeWM/Zfnfm4xS1V\ndpPppkZTAgMBAAECggEAH9Gjl6SAS94mdxuUgDbWpNdMi7wQqBkvDKqqXvwQfv2z\nJxx9XXmVOmryHnqVI6zu0j49PLn2wjmjrXLDEunQVMkFMrzAU5zrz/NaaKN4xR+4\neBvjcXu4xWYsz5N18rDNpvUVx6JgiLEFbYcwpS3/fnwhpFDwqUoyXHnUzfRG47Gj\nd6E1DjdjuvvykpLmNUVSWnzsA65flfSHy8kbJIQfHq/b2mAhQ5ovLiij6fohyjfv\nHHoUhR+UHA2GXXG89tTAgf2TKpgMp7C+6DxWK7QoDh8IsNRc4avYDUEDaplvgr8s\nYzxDfOEuhBrn22ut75BlY5eq8ss2kT2McpolrwXl2QKBgQD0t8pDIFbFw8ftu4fG\njnRafyQPXMHglaY89woizIw6jZk8iQW9+Q27J3JCfSR4OyNaF3cm8TykN5hdHEaW\nRZ9F9C38xSudtpJP+M8kEvHRC6fuAMG/SMMEsIT4RgEjiVsgyxATVTBWa4CywElK\n9vI37hSOn9bHKGxpw+yHDWgg6wKBgQDNF12+pZl+7jDQveCSVxhSKWBot4Kqfb9X\ntGcTYj1IE7pwaZFijygrz0mVayNvpcygKbAXRsrZppoOEJL/0gJhUkJyUez8LXCZ\nCBv12SVETrK2+IG/aBa91EHD1hKQcj11xs241/5lk4mwmeGon2veGaBWQKiiaMaq\njuO1fThWOQKBgQDPLu8qB64PPyL8DcH1A9RUbcHc07484tXcVZaaQa0TQaCTlLps\nzPeoFMxyqDqBJChY9Pbm3GRn772qTu8f+I/RDNsGXvP/UXvsAw10UCm0v3aMVM2z\noemiBcR94d7C9F5XlDPm+j+zWs6aB5vFwO7vFT0IRyDyejHXFY4iBOK8wwKBgQCU\nm9nRyyzuTKoSl4OihnmZD2JMfqyv3W5InvARm53MHH979QLj59ez5v/qxTdoLzuW\n0p5GP4W9MHtwtZHOzN3spy5+p96Q3Fw6hyW7fx0B4gSdkHRzvXi9FJCS1wucnyrp\nrKRkzB4KfF3JGbfp95qx1N/ZoACRrlpGPEPDvniUAQKBgQCWzJ4RFYiYNFT+VF1R\n+FMLQB2JCII8Kf1hxUvwEQP7bnM3d62TPhayLHZx8uzsCVxKEc2Jh3nm/y1ftbd5\nptNf559sfm/lQbrJd7VH3m8veq2zQZFnJ/jOierO69yP1Et01SdHAeitscmiXTZk\nQZJGr3Sywt4dw658aCm5EHpQwg==\n-----END PRIVATE KEY-----\n",
//   "client_email": "firebase-adminsdk-ijo5h@task-manegement-app-919e7.iam.gserviceaccount.com",
//   "client_id": "117190618868792912551",
//   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//   "token_uri": "https://oauth2.googleapis.com/token",
//   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//   "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-ijo5h%40task-manegement-app-919e7.iam.gserviceaccount.com",
//   "universe_domain": "googleapis.com"
// };

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

module.exports = admin;
