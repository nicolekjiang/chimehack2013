import ui.View as View;
import ui.ImageView as ImageView;
import src.constants.gameConstants as gameConstants;
import ui.TextView as TextView;
import ui.widget.ButtonView as ButtonView;
import ui.TextEditView as TextEditView;
import device;
import src.views.ErrorView as ErrorView;
import src.collections.Students as StudentsCollection;

exports = Class(View, function (supr) {

	var loginSemaphore = 2;
	function login(err) {
		loginSemaphore--;
		if (err) {
			alert('Error connecting to server');
		} else if (!loginSemaphore) {
			var username = this.usernameEditView.getText(),
				student = this._studentCollection.modelWithId(username);
			if (!student) {
				// TODO: invalid username, show error
				alert('Unknown student ' + username)
			} else {
				GLOBAL.student = student;
				this.emit('start');
			}
		}
	}

	this.init = function(opts) {

		opts = merge(opts, {
			x: 0,
			y: 0,
			width: gameConstants.GAME_WIDTH,
			height: gameConstants.GAME_HEIGHT
		});

		supr(this, 'init', [opts]);

		this.buildView();

		(this._studentCollection = new StudentsCollection()).fetch(login.bind(this));
	};

	this.buildView = function() {

		this.background = new ImageView({
			parent: this,
			x: 0,
			y: 0,
			width: gameConstants.GAME_WIDTH,
			height: gameConstants.GAME_HEIGHT,
			image: "resources/images/backgrounds/login_bg.jpg",
			opacity: 1
		});

		/*this.TitleText = new TextView({
			parent: this,
			x: gameConstants.GAME_WIDTH / 2 - 220,
			y: 50,
			width: 450,
			height: 150,
			text: "Trick or Treat for UNICEF",
			fontFamily: gameConstants.MAIN_FONT,
			size: 140,
			canHandleEvents: false
		});*/

		this.usernameEditView = new TextEditView({
			superview: this,
			x: 160,
			y: 380,
			//backgroundColor: "#ffffff",
			width: 456,
			height: 80,
			fontWeight: "bold",
			//horizontalAlign: "center",
			color: "#ffffff",
			hintColor: "#ffffff",
			hint: "Enter Username"
		});

		this.accessCodeEditView = new TextEditView({
			superview: this,
			x: 160,
			y: 500,
			//backgroundColor: "#ffffff",
			width: 456,
			height: 80,
			fontWeight: "bold",
			//horizontalAlign: "center",
			color: "#ef7c21",
			hintColor: "#ef7c21",
			hint: "Enter Access Code"
		});

		this.loginButton = new ButtonView({
			superview: this,
			width: 190,
			height: 125,
			x: gameConstants.GAME_WIDTH / 2 - 100,
			y: 670,
			images: {
				up: "resources/images/buttons/login_button.png"
				//down: "resources/images/buttons/brown_button_down.png"
			},
			on: {
				up: bind(this, function () {
					login.call(this);
				})
			}
			/*title: "Login",
			text: {
			  color: "#ffffff",
			  size: 36,
			  autoFontSize: false,
			  autoSize: false
			}*/
		});

		this.errorDialog = new ErrorView({
			parent: this
		});
		this.addSubview(this.errorDialog);

	};
});
