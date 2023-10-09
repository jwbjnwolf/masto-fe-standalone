# Mastodon Glitch Edition (standalone frontend)

This is a very hacky fork of akkoma-masto-fe that adds standalone support (meaning your browser can OAuth against an arbitrary instance). It's currently tested to "work" (login doesn't break, basic functionality works) with Iceshrimp and GoToSocial (and it obviously works with Mastodon).

To set this up yourself, clone the repo into e.g. `/home/user/masto-fe-standalone` and run `yarn && yarn build:development`.

Then configure nginx for a subdomain like this:

```
map $http_upgrade $connection_upgrade {
        default upgrade;
        ''      close;
}

server {
        include sites/example.com/inc/ssl.conf;
        server_name masto.example.com;

        location / {
                root /home/user/masto-fe-standalone/public/;
                index index.html;
                try_files $uri /index.html;
        }
}
```

And open `https://masto.example.com` in your browser, type in your instance domain, press the button & follow the OAuth flow.

Should anything break, open `https://masto.example.com/logout.html` or clear local storage manually.
