/** @jsx React.DOM */

(function() {
  var LibraryDropdown = React.createClass({
    changeStatus: function(newStatus) {
      var controller = this.props.view.get('controller');
      var libraryEntry = this.props.content;
      controller.send('setStatus', libraryEntry, newStatus);
    },

    changePrivate: function(newPrivate) {
      var controller = this.props.view.get('controller');
      var libraryEntry = this.props.content;
      controller.send('setPrivate', libraryEntry, newPrivate);
    },

    changeNotes: function(event) {
      this.props.content.set('notes', event.target.value);
      this.forceUpdate();
    },

    toggleRewatching: function(event) {
      if (this.props.view.get('user.viewingSelf')) {
        var controller = this.props.view.get('controller');
        var libraryEntry = this.props.content;
        controller.send('toggleRewatching', libraryEntry);
      }
    },

    changeRewatchCount: function(event) {
      if (!this.props.view.get('user.viewingSelf')) { return; }

      var focused = $(event.target).is(":focus");
      var originalRewatchCount = this.props.content.get('rewatchCount');
      var rewatchCount = parseInt(event.target.value);

      // Let's not go below zero.
      if (rewatchCount < 0) { rewatchCount = originalRewatchCount; }

      this.props.content.set('rewatchCount', rewatchCount);

      if (!focused) {
        Ember.run.debounce(this, this.saveLibraryEntry, 500);
      }
    },

    saveLibraryEntry: function (event) {
      if (event && event.target.nodeName == "FORM") {
        event.preventDefault();
        event.target.querySelector("input").blur();
      }
      else {
        if (this.props.content.get('isDirty')) {
          var controller = this.props.view.get('controller');
          var libraryEntry = this.props.content;
          controller.send('saveLibraryEntry', libraryEntry);
        }
      }
    },

    componentDidUpdate: function(prevProps, newProps, rootNode) {
      if (this.props.dropdownOpen) {
        $(rootNode).find("textarea.personal-notes").autosize({append: "\n"});

        if (this.props.view.get('user.viewingSelf')) {
          var controller = this.props.view.get('controller');
          var libraryEntry = this.props.content;
          $(rootNode).find(".awesome-rating-widget").AwesomeRating({
            editable: true,
            type: this.props.view.get('user.ratingType'),
            rating: this.props.content.get('rating'),
            update: function (newRating) {
              controller.send('setRating', libraryEntry, newRating);
            }
          });
        }
      }
    },

    render: function() {
      var content = this.props.content;
      var validStatuses = ["Currently Watching", "Plan to Watch", "Completed", "On Hold", "Dropped"];

      var saveButtonClass = React.addons.classSet({
        "btn": true,
        "personal-notes-save": true,
        "btn-primary": this.props.content.get('isDirty')
      });

      if (this.props.dropdownOpen) {
        return (
          <div className="library-dropdown">
            <div className="drop-arrow" />
            <div className="col-md-12">
              <textarea className="personal-notes" placeholder={"Personal notes about " + content.get('anime.canonicalTitle')} value={this.props.content.get('notes')} onChange={this.changeNotes} />
              <button className={saveButtonClass} onClick={this.saveLibraryEntry}>Save</button>
            </div>
            <div className="col-md-2 no-padding-right hidden-xs hidden-sm">
              <img className="drop-thumb" src={content.get('anime.posterImage')} />
            </div>
            <div className="col-md-6 col-sm-8 hidden-xs">
              <h4>{content.get('anime.canonicalTitle')}</h4>
              <p className="drop-description">{content.get('anime.synopsis')}</p>
            </div>
            <div className="col-md-4 col-sm-4">
              <div className="drop-options">
                <div className={this.props.view.get('user.viewingSelf') ? '' : 'hidden'}>
                  <div className="btn-group btn-block status-select">
                    <button className="btn btn-block dropdown-toggle" data-toggle="dropdown">
                      {content.get('status')}
                      <i className="fa fa-caret-down" />
                    </button>
                    <ul className="dropdown-menu">
                      {
                        validStatuses.map(function(s) {
                          return (<li key={s}><a onClick={this.changeStatus.bind(this, s)}>{s}</a></li>);
                        }.bind(this))
                      }
                    </ul>
                  </div>
                  <hr />

                  <div className="text-center">
                    <form>
                      <label className="radio-inline">
                        <input name="private" type="radio" value="true" checked={this.props.content.get('private')} onClick={this.changePrivate.bind(this, true)} />
                        Private
                      </label>
                      <label className="radio-inline">
                        <input name="private" type="radio" value="false" checked={!this.props.content.get('private')} onClick={this.changePrivate.bind(this, false)} />
                        Public
                      </label>
                    </form>
                  </div>
                  <hr />

                  <div className="text-center">
                    <div className="awesome-rating-widget">
                      RATING WIDGET HERE.
                    </div>
                  </div>
                  <hr />
                </div>

                <div className="text-center">
                  <label>
                    <input type="checkbox" checked={this.props.content.get('rewatching')} onChange={this.toggleRewatching} />
                    Rewatching
                  </label>
                  <hr />
                </div>

                <div className="text-center">
                  <form className="form-inline" onSubmit={this.saveLibraryEntry}>
                    Rewatched
                    <input type="number" className="form-control" style={ {width: "40px", padding: "3px", margin:"0 4px", "text-align": "center"} } value={this.props.content.get('rewatchCount')} onChange={this.changeRewatchCount} onBlur={this.saveLibraryEntry} />
                    times.
                  </form>
                </div>
              </div>
            </div>
          </div>
        );
      }
      else {
        return (
          <div />
        );
      }
    }
  });

  var LibraryEntry = React.createClass({
    getInitialState: function() {
      return {dropdownOpen: false};
    },

    toggleDropdown: function(event) {
      if (event.target.nodeName != "INPUT") {
        this.setState({dropdownOpen: !this.state.dropdownOpen});
      }
    },

    changeProgress: function(event) {
      if (!this.props.view.get('user.viewingSelf')) { return; }

      var focused = $(event.target).is(":focus");
      var originalEpisodesWatched = this.props.content.get('episodesWatched');
      var episodesWatched = parseInt(event.target.value);

      // Don't allow exceeding the show's episode count.
      var animeEpisodeCount = this.props.content.get('anime.episodeCount');
      if (animeEpisodeCount && episodesWatched > animeEpisodeCount) {
        episodesWatched = originalEpisodesWatched;
      }

      // Let's not go below zero.
      if (episodesWatched < 0) { episodesWatched = originalEpisodesWatched; }

      this.props.content.set('episodesWatched', episodesWatched);

      if (!focused) {
        Ember.run.debounce(this, this.saveEpisodesWatched, 500);
      }
    },

    saveEpisodesWatched: function(event) {
      if (event && event.target.nodeName == "FORM") {
        event.preventDefault();
        event.target.querySelector("input").blur();
      }
      else {
        if (this.props.content.get('isDirty')) {
          var controller = this.props.view.get('controller');
          var libraryEntry = this.props.content;
          controller.send('saveEpisodesWatched', libraryEntry);
        }
      }
    },

    render: function() {
      var content = this.props.content;

      var ratingDivClass = React.addons.classSet({
        "list-item-score": true,
        "not-rated": Ember.isNone(content.get('rating'))
      });

      var listGroupClass = React.addons.classSet({
        "list-group-item": true,
        "odd": this.props.index % 2 == 1,
        "even": this.props.index % 2 == 0
      });

      var rating;
      if (content.get('rating')) {
        if (this.props.view.get('user.ratingType') == "advanced") {
          rating = (
            <span>
              <i className="fa fa-star" />
              {' '}
              {content.get('rating').toFixed(1)}
            </span>
          );
        }
        else {
          var iconClass;
          if (content.get('positiveRating')) { iconClass = "fa fa-smile-o"; }
          if (content.get('negativeRating')) { iconClass = "fa fa-frown-o"; }
          if (content.get('neutralRating')) { iconClass = "fa fa-meh-o"; }
          rating = (<i className={iconClass} />);
        }
      }
      else {
        rating = (<span>----</span>);
      }

      return (
        <div className="library-entry">
          <div className={listGroupClass} onClick={this.toggleDropdown}>
            <div className="list-item-left">
              {content.get('anime.canonicalTitle')}
              { content.get('private')
                ? <span className="anime-label"><i className="fa fa-eye-slash" /></span>
                : ''
              }
              { content.get('rewatching')
                ? <span className="anime-label"><i className="fa fa-repeat" /></span>
                : ''
              }
              { content.get('anime.airingStatus') == "Finished Airing"
                ? ''
                : <span className="anime-label"><span className="label label-primary">{content.get('anime.airingStatus')}</span></span>
              }
            </div>
            <div className="list-item-right">
              <div className="list-item-progress">
                <form style={ {display: "inline"} } onSubmit={this.saveEpisodesWatched} >
                  <input className="input-progress" type="number" pattern="[0-9]*" value={content.get('episodesWatched')} onChange={this.changeProgress} onBlur={this.saveEpisodesWatched} />
                </form>
                <span className="progress-sep">/</span>
                <span className="list-item-total">{content.get('anime.displayEpisodeCount')}</span>
              </div>
              <div className={ratingDivClass}>
                {rating}
              </div>
              <div className="list-item-type">
                {content.get('anime.showType')}
              </div>
            </div>
          </div>

          <LibraryDropdown dropdownOpen={this.state.dropdownOpen} content={content} view={this.props.view} />
        </div>
      );
    }
  });

  var LibrarySection = React.createClass({
    render: function() {
      return (
        <div className="list-group">
          <div className="panel-divider">
            <span>{this.props.content.get('title')}</span>
            <span className="right-align">
              {this.props.content.get('content.length')}
              {' '}
              {this.props.content.get('content.length') == 1 ? 'Title' : 'Titles'}
            </span>
          </div>
          {
            this.props.content.get('content').map(function(entry, i) {
              return (<LibraryEntry key={entry.get('anime.id')} view={this.props.view} content={entry} index={i} />);
            }.bind(this))
          }
        </div>
      );
    }
  });

  this.LibrarySectionsReactComponent = React.createClass({
    render: function() {
      return (
        <div>
          {
            this.props.content.filter(function (section) {
              return section.get('visible');
            }).map(function (section) {
              return (<LibrarySection key={section.get('title')} content={section} view={this.props.view} />);
            }.bind(this))
          }
        </div>
      );
    }
  });
})();