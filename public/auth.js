document.addEventListener("DOMContentLoaded", async function() {
  await ready();
});

async function ready() {
  const domain = localStorage.getItem('domain');
  let accessToken = localStorage.getItem(`access_token_${domain}`);

  if (domain) document.getElementById('instance').value = domain;

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (domain && code && !accessToken) await getToken(code, domain).then(res => accessToken = res);
  if (accessToken) await setStateAndRedirect(accessToken, domain);
}

async function auth() {
  setMessage('Please wait');
  const instance = document.getElementById('instance').value;
  const domain = instance.match(/(?:https?:\/\/)?(.*)/)[1];
  if (!domain) {
    document.getElementById('message').textContent = 'Invalid instance';
    return;
  }

  localStorage.setItem('domain', domain);

  if (!localStorage.getItem(`client_id_${domain}`) || !localStorage.getItem(`client_secret_${domain}`)) {
    await registerApp(domain);
  }

  authorize(domain);
}

async function registerApp(domain) {
  setMessage('Registering app');

  const appsUrl = `https://${domain}/api/v1/apps`;
  const formData = new FormData();
  formData.append('client_name', 'Masto-FE standalone');
  formData.append('redirect_uris', document.location.origin + document.location.pathname);
  formData.append('scopes', 'read write follow push');

  // eslint-disable-next-line promise/catch-or-return
  await fetch(appsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(formData),
  })
    .then(async res => {
      const app = await res.json();
      localStorage.setItem(`client_id_${domain}`, app.client_id);
      localStorage.setItem(`client_secret_${domain}`, app.client_secret);
    });
}

function authorize(domain) {
  setMessage('Authorizing');
  const clientId = localStorage.getItem(`client_id_${domain}`);
  document.location.href = `https://${domain}/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${document.location.origin + document.location.pathname}&scope=read+write+follow+push`;
}

async function getToken(code, domain) {
  setMessage('Getting token');

  const tokenUrl = `https://${domain}/oauth/token`;
  const clientId = localStorage.getItem(`client_id_${domain}`);
  const clientSecret = localStorage.getItem(`client_secret_${domain}`);

  const formData = new FormData();
  formData.append('grant_type', 'authorization_code');
  formData.append('code', code);
  formData.append('client_id', clientId);
  formData.append('client_secret', clientSecret);
  formData.append('scope', 'read write follow push');
  formData.append('redirect_uri', document.location.origin + document.location.pathname);


  // eslint-disable-next-line promise/catch-or-return
  return fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(formData),
  })
    .then(async res => {
      const app = await res.json();
      if (app.access_token) localStorage.setItem(`access_token_${domain}`, app.access_token);
      return app.access_token;
    });
}

async function setStateAndRedirect(access_token, domain) {
  setMessage('Assembling state object');
  const apiUrl = `https://${domain}/api`;
  const instance = await fetch(`${apiUrl}/v1/instance`).then(async p => await p.json());
  const options = {headers: {Authorization: `Bearer ${access_token}`}};
  const credentials = await fetch(`${apiUrl}/v1/accounts/verify_credentials`, options).then(async p => await p.json());
  const state = {
    "accounts": {
      "plc":{
        "accepts_direct_messages_from":"everybody",
        "acct": credentials.acct,
        "avatar": credentials.avatar,
        "avatar_static": credentials.avatar_static,
        "bot": credentials.bot,
        "created_at": credentials.created_at,
        "display_name": credentials.display_name,
        "emojis":[],
        "fields":[],
        "follow_requests_count":0,
        "followers_count": credentials.followers_count,
        "following_count": credentials.following_count,
        "fqn":`${credentials.acct}@${domain}`,
        "header": credentials.header,
        "header_static": credentials.header_static,
        "id": credentials.id,
        "last_status_at": credentials.created_at,
        "locked": credentials.locked,
        "note":"",
        "source": credentials.source,
        "statuses_count": credentials.statuses_count,
        "url": credentials.url,
        "username": credentials.acct
      }
    },
    "char_limit": instance.configuration.statuses.max_characters,
    "compose": {
      "allow_content_types": [
        "text/x.misskeymarkdown"
      ],
      "default_privacy": credentials.source.privacy,
      "default_sensitive": credentials.source.sensitive,
      "me": credentials.id
    },
    "media_attachments": {
      "accept_content_types": instance.configuration.media_attachments.supported_mime_types
    },
    "meta": {
      "access_token": access_token,
      "admin": "0",
      "advanced_layout": true,
      "auto_play_gif": false,
      "boost_modal": false,
      "compact_reaction": false,
      "delete_modal": true,
      "display_sensitive_media": false,
      "domain": domain,
      "enable_reaction": true,
      "locale": "en",
      "mascot": "/images/mascot.svg",
      "max_toot_chars": instance.configuration.statuses.max_characters,
      "me": credentials.id,
      "reduce_motion": false,
      "show_quote_button": true,
      "base_url": `https://${domain}`,
      "streaming_api_base_url": `wss://${domain}`,
      "title": `${instance.title}`,
      "unfollow_modal": true
    },
    "poll_limits": {
      "max_expiration": instance.configuration.polls.max_expiration,
      "max_option_chars": instance.configuration.polls.max_characters_per_option,
      "max_options": instance.configuration.polls.max_options,
      "min_expiration": instance.configuration.polls.min_expiration
    },
    "push_subscription": null,
    "rights": {
      "admin": false,
      "delete_others_notice": false
    },
    "settings": {}
  };

  localStorage.setItem('initial-state', JSON.stringify(state));
  window.location.href = '/';
}

function setMessage(message) {
  document.getElementById('message').textContent = message;
  document.getElementById('btn').enabled = false;
}