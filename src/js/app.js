var FacebookAuth = React.createClass({
  propTypes: {
    onUserAuthenticated: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      loggedIn: false,
      fbName: ''
    }
  },

  componentDidMount: function() {
    window.fbAsyncInit = function() {
      FB.init({
        appId      : '1157541270945658',
        cookie     : true,  // enable cookies to allow the server to access
                            // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.2' // use version 2.2
      });

      this.checkLoginState();
    }.bind(this);

    // Load the SDK asynchronously
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/all.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  },

  getUserData: function() {
    FB.api('/me', function(response) {
      this.setState({ loggedIn: true, fbName: response.name });
      this.props.onUserAuthenticated(response.id);
    }.bind(this));
  },

  statusChangeCallback: function(response) {
    if (response.status === 'connected') {
      this.getUserData();
    } else if (response.status === 'not_authorized') {
      this.setState({loggedIn: false})
    } else {
      this.setState({loggedIn: false})
    }
  },

  checkLoginState: function() {
    FB.getLoginStatus(function(response) {
      this.statusChangeCallback(response);
    }.bind(this));
  },

  handleClick: function() {
    FB.login(function() {
      this.checkLoginState();
    }.bind(this));
  },

  render: function() {
    var welcomeMsg;
    if(this.state.fbName) {
      welcomeMsg = <p>You are now ready for the next step.
        Choose one of the templates below and click 'Create' to create a
        download link for your new profile picture.</p>
    } else {
      welcomeMsg = <p>Please login with your Facebook account to load your profile picture.
        Be sure we store no data about you.</p>;
    }
    return (
      <div className="facebook-auth mdl-cell mdl-cell--12-col">
        <div className="fb-card-wide mdl-card mdl-shadow--2dp">
          <div className="mdl-card__title">
            <h2 className="mdl-card__title-text">
              Welcome
              {(
                this.state.loggedIn ? <span>, {this.state.fbName}!</span> : false
              )}
            </h2>
          </div>
          <div className="mdl-card__supporting-text">
            {welcomeMsg}
          </div>
          <div className="mdl-card__actions mdl-card--border">
            {(
              this.state.loggedIn ? <i className="material-icons md-36 green">check_circle</i> :
                <a
                  className="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect"
                  href="javascript:;" onClick={this.handleClick}>
                  Login
                </a>
            )}
          </div>
        </div>
      </div>
    );
  }
});

var TemplateSelect = React.createClass({
  propTypes: {
    onTemplateSelected: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      templates: []
    }
  },

  componentDidMount: function() {
    $.ajax({
      url: '/templates/all',
      dataType: 'json',
      cache: false,
      success: function(response) {
        this.setState({templates: response.data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.log(err);
      }.bind(this)
    });
  },

  onSelectionChanged: function (e) {
    this.props.onTemplateSelected(e.currentTarget.value);
  },

  render: function() {
    return (
      <div className="template-select mdl-cell mdl-cell--12-col">
        <div className="mdl-grid">
          { this.state.templates.map(function(template, idx) {
              var imageStyle = {
                background: "url('" + template.thumb + "') center / cover"
              };
              return(
                <div key={idx}
                  className="template-card-image mdl-card mdl-shadow--2dp \
                  mdl-cell mdl-cell--3-col">
                  <div className="mdl-card__title mdl-card--expand"
                    style={imageStyle}></div>
                    <div className="mdl-card__actions">
                    <span className="template-card-image__filename">
                      <input type="radio" name="template"
                        value={template.id} id={"template"+template.id}
                        onChange={this.onSelectionChanged}/>
                        <label htmlFor={"template"+template.id}>{template.title}</label>
                    </span>
                  </div>
                </div>
              );
            }.bind(this))
          }
        </div>
      </div>
    );
  }
});

var CausesView = React.createClass({
  getInitialState: function() {
    return {
      fbId: null,
      templateId: null,
      resultPhoto: null,
      loading: false
    }
  },

  onUserAuthenticated: function(fbId) {
    this.setState({ fbId: fbId });
  },

  onTemplateSelected: function(templateId) {
    this.setState({ templateId: templateId });
  },

  onSubmit: function(e) {
    this.setState({
      loading: true,
      resultPhoto: null
    });

    var requestUrl = '/templates/' + this.state.templateId
      + '/fbId/' + this.state.fbId;
    $.ajax({
      url: requestUrl,
      method: 'post',
      dataType: 'json',
      cache: false,
      success: function(response) {
        this.setState({
          resultPhoto: response.data.url,
          loading: false
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.log(err);
        this.setState({ loading: false });
      }.bind(this)
    });
  },

  componentDidUpdate: function() {
    // This upgrades all upgradable components (i.e. with 'mdl-js-*' class)
    componentHandler.upgradeDom();
  },

  render: function() {
    var result, loadingClass;

    if (this.state.resultPhoto) {
      var imageStyle = {
        background: "url('" + this.state.resultPhoto + "') center / cover"
      }
      result =
        <div>
          <div className="result-card-image mdl-card mdl-shadow--2dp">
            <div className="mdl-card__title mdl-card--expand" style={imageStyle}></div>
            <div className="mdl-card__actions">
              <span className="result-card-image__filename">
                Download
                <a href={this.state.resultPhoto} download>
                  <i className="material-icons md-36 download">file_download</i>
                </a>
              </span>
            </div>
          </div>
          <br/>
          * Download link will expire after one hour.
        </div>;
    }

    if(this.state.loading) {
      loadingClass = 'is-active is-upgraded';
    } else {
      loadingClass = '';
    }

    return (
      <div className="causes-view mdl-grid">
        <FacebookAuth onUserAuthenticated={this.onUserAuthenticated} />

        <TemplateSelect onTemplateSelected={this.onTemplateSelected} />

        <div className="submit-btn-container mdl-cell mdl-cell--12-col">
          <button type="submit" onClick={this.onSubmit}
            className="mdl-button mdl-js-button mdl-button--raised \
            mdl-js-ripple-effect mdl-button--accent mdl-cell"
            disabled={!this.state.fbId || !this.state.templateId || this.state.loading}>
            Create
          </button>
        </div>

        <div className="result-container mdl-grid">
          <div className={"mdl-spinner mdl-js-spinner "+ loadingClass}></div>
          {result}
        </div>
      </div>
    );
  }

});
