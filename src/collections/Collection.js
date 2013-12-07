/*
The MIT License (MIT)

Copyright (c) 2013 Bryan Hughes, Nicole Jiang, Jaayden Halko , Bonnie Li

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*global XMLHttpRequest, Class, Emitter, Model*/
import event.Emitter as Emitter;
import ..models.Model as Model;

var LOCAL = true,
	ENDPOINT_PREFIX = 'http://' + (LOCAL ? 'localhost' : '192.241.239.220') + ':8080/api/';

exports = Class(Emitter, function (supr) {
	this.init = function (endpoint, constructor, models) {
		supr(this, 'init', arguments);
		this._endpoint = ENDPOINT_PREFIX + endpoint;
		this._constructor = constructor;
		if (models instanceof Model) {
			models = [ models ];
		}
		this._models = Array.isArray(models) ? models : [];
	};

	/**
	 * Adds a model to the collection, if it doesn't already exist
	 *
	 * add(model) -> undefined
	 *	-model <..models.Model> The model to add
	 */
	this.add = function (model) {
		if (this._models.indexOf(model) != -1) {
			return;
		}
		this._models.push(model);
		this.emit('added', {
			location: this._models.length - 1,
			model: model
		});
	};

	this.remove = function (model) {
		var location = this._models.indexOf(model);
		if (location == -1) {
			return;
		}
		this._models.splice(location, 1);
		this.emit('removed', {
			location: location,
			model: model
		});
	};

	this.fetch = function (callback) {
		var xhr = new XMLHttpRequest(),
			err;
		xhr.onerror = function(e) {
			err = e.target.status;
		};
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				if (xhr.status != 200) {
					callback && callback(err || 'HTTP request failed with code ' + xhr.status);
					return;
				}
				var response,
					semaphoreCount = 0;
				try {
					response = JSON.parse(xhr.responseText);
				} catch(e) {
					callback && callback(e.toString());
					return;
				}
				function fetchResponse() {
					semaphoreCount--;
					if (!semaphoreCount) {
						callback && callback();
					}
				}
				for (var id in response) {
					var found;
					for (var i = 0, len = this._models.length; i < len; i++) {
						if (this._models[i].get('id') == id) {
							this._models[i].fetch(fetchResponse);
							semaphoreCount++;
							found = true;
						}
					}
					if (!found) {
						var newModel = new this._constructor({ id: id });
						this._models.push(newModel);
						newModel.fetch(fetchResponse);
						semaphoreCount++;
					}
				}
				console.log(response);
				if (!semaphoreCount) {
					callback && callback();
				}
			}
		}.bind(this);
		xhr.open('get', this._endpoint, true);
		xhr.send();
	};

	this.save = function (callback) {};

	this.filter = function (filter) {};

	this.values = function () {};
});