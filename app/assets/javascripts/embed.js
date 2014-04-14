// Helpful Embed JS

// When somebody with an Account includes a script tag to this file on their own
// website, it'll embed a simple web embed that posts to Helpful.
//
// It's attached to the DOM with the use of the `data-helpful` attribute:
//
//    <a href="#" data-helpful="my-account-slug">Click me to show embed</a>
//
// The value of `data-helpful` should be the account slug of the Helpful account
// where the new message should be created.
//
// TODO This script relies on jQuery being installed on the page. Future
// versions should get rid of that requirement so more people can install it.
//
$(function() {
  var HelpfulEmbed, embed;

  // HelpfulEmbed Class
  HelpfulEmbed = function() {
    this.bg = $('<div class="helpful-bg"></div>').hide().html('').appendTo(document.body);
    this.el = $('<div></div>').hide().html('').appendTo(document.body);
  }

  // Opens the embed on top of an element
  HelpfulEmbed.prototype.open = function(target) {
    this.target = target;
    var domnode = target.get(0);
    var tempscript = document.createElement("script");
    tempscript.type = "text/javascript";
    tempscript.id = "helpful_tempscript";
    tempscript.src = "//helpful.io/assets/embed_jsonp.js?body=1"
    tempscript.src = "http://localhost:5000/assets/embed_jsonp.js?body=1" //DEV
    this.el.get(0).appendChild(tempscript);
    var tempcss = document.createElement("link");
    tempcss.rel = 'stylesheet'
    tempcss.type = 'text/css'
    tempcss.href = '//helpful.io/assets/embed.css'
    tempcss.href = 'http://localhost:5000/assets/embed.css' //DEV
    tempcss.media = 'all'
    document.head.appendChild(tempcss);
  }
  HelpfulEmbed.prototype.jsonpReturned = function(data) {
    var target = this.target
    var $target, targetOffset, targetOffsetBottom;
    var that = this;

    $target = $(this.target);
    targetOffset = $target.offset();

    this.el.html(data.html);

    this.el.css({
      top: $(window).height()/2 - this.el.height()/2,
      left: $(window).width()/2,
      position: 'absolute'
    });

    this.el.show();
    this.bg.fadeIn();

    $(this.bg).click(function(){
      that.close();
    });

    //give the page time to index the nodes
    setTimeout(function(){
      console.log(that.el[0].getElementsByTagName('form')[0]);
      console.log(target.data('helpful'));
      that.el[0].getElementsByTagName('form')[0].onsubmit = function(e){
        //TODO: pass through conversation_id as well

        window.HelpfulEmbedJsonpCallback = function(){
          that.el.hide();
        }
        var params = "content="+encodeURIComponent(that.el[0].querySelector("#question").value);
        params += "&email="+encodeURIComponent(that.el[0].querySelector("#email").value)
        params += "&account="+encodeURIComponent(target.data('helpful'))
        params += "&callback=HelpfulEmbedJsonpCallback"
        var tempscript = document.createElement("script");
        tempscript.type = "text/javascript";
        tempscript.id = "helpful_tempscript_message";
        tempscript.src = "//helpful.io/api/api/messages/create?"+params
        tempscript.src = "/api/messages/create?"+params //DEV
        that.el[0].appendChild(tempscript);

        e.preventDefault();
        return false;
      }
    }, 0);
  }

  // Closes the embed popup at the target
  HelpfulEmbed.prototype.close = function(target) {
    this.el.hide();
    this.bg.fadeOut();
  }

  // Toggles the opening and closing of a popup
  HelpfulEmbed.prototype.toggle = function(target) {
    if(!this.el.is(':visible')) {
      this.open(target);
    } else {
      this.close(target);
    }
  }

  // TODO This should be store in the DOM on the target element. That will allow
  // multiple popups to exist on the page. At the moment there's only a singular
  // popup.
  window.helpful_embed = new HelpfulEmbed();

  // Binds the HelpfulEmbed class to the calling elements.
  $('[data-helpful]').on('click.helpful', function(e) {
    e.preventDefault();
    helpful_embed.toggle($(e.target));
    return true;
  });
});
