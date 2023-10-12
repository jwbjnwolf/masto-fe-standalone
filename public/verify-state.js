loadState().then(_ => null);

async function loadState() {
  const domain = localStorage.getItem('domain');
  const access_token = localStorage.getItem('access_token');
  const storedState = localStorage.getItem('initial_state');

  if (!domain || !access_token) {
    window.location.href = '/login.html';
    return;
  }

  if (storedState && window.location.pathname !== '/prepare.html') {
    document.getElementById('initial-state').textContent = storedState;
  }

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
      "me": credentials.id,
      "reduce_motion": false,
      "show_quote_button": true,
      "base_url": `https://${domain}`,
      "streaming_api_base_url": `wss://${domain}`,
      "title": `${instance.title}`,
      "unfollow_modal": true,
      "source_url": 'https://iceshrimp.dev/iceshrimp/masto-fe-standalone',
      "version": instance.version
    },
    "max_toot_chars": instance.configuration.statuses.max_characters,
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
    "settings": {

    }
  };

  const json = JSON.stringify(state);
  if (window.location.pathname !== '/prepare.html') document.getElementById('initial-state').textContent = json;
  localStorage.setItem("initial_state", json);
  if (window.location.pathname === '/prepare.html') window.location.href = '/';
}