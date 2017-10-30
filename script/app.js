//Store set of locations on the map
var locationSet = [
  {
    name: "Home",
    lat: 1.314808,
    long: 103.841959
  },
  {
    name: "Newton MRT",
    lat: 1.313607,
    long: 103.837811
  },
  {
    name: "Suntec Tower 5",
    lat: 1.294551,
    long: 103.858252
  },
  {
    name: "Singapore Botanic Garden",
    lat: 1.313840,
    long: 103.815914
  },
  {
    name: "Paya Lebar Air Base",
    lat: 1.358156,
    long: 103.911255
  },
  {
    name: "Bishan-Ang Mo Kio Park",
    lat: 1.363409,
    long: 103.843561
  },
  {
    name: "Tree Top Walk",
    lat: 1.360729,
    long: 103.812522
  },
  {
    name: "Novena MRT",
    lat: 1.320430,
    long: 103.843818
  }
];

//Location class to store data for each location
var Location = function(data) {
  var self = this;
  this.name = data.name;
  this.lat = data.lat;
  this.long = data.long;
  this.street = "";
  this.zip = "";
  this.city = "";
  this.formattedAddress = "";
  this.contentString = "";
  this.visible = ko.observable(true);

  //Create a marker on map for the location
  this.marker = new google.maps.Marker({
    position: new google.maps.LatLng(this.lat, this.long),
    map: map,
    title: this.name
  });

  //Display marker on map based on visible flag
  this.displayMarker = ko.computed(function() {
    if (this.visible()) {
      this.marker.setMap(map);
    } else {
      this.marker.setMap(null);
    }
    return true;
  }, this);

  //Define FourSquare API call string
  var foursqaureURL = "https://api.foursquare.com/v2/venues/search?client_id=" + clientID + "&client_secret=" + clientSecret + "&ll=" + this.lat + "," + this.long + "&m=foursquare&v=20171029";

  //Call FourSquare API to get formatted address for each location
  $.getJSON(foursqaureURL).done(function(data) {
    var results = data.response.venues[0];

    self.street = results.location.formattedAddress[0];
    if(typeof self.street === 'undefined') {
      self.street = "";
    }

    self.zip = results.location.formattedAddress[1];
    if (typeof self.zip === 'undefined') {
      self.zip = "";
    }

    self.city = results.location.formattedAddress[2];
    if (typeof self.city === 'undefined') {
      self.city = "";
    }

    self.formattedAddress = self.street + ", " + self.city + " " + self.zip;
  }).fail(function() {
    alert("There was an error loading FourSquare API call. Please refresh the page and try again.");
  });

  //Define content inside infowindow
  //Code reference: https://developers.google.com/maps/documentation/javascript/infowindows
  this.contentString = '<h4>' + this.name + '</h4>' + '<p>' + this.formattedAddress + '</p>';

  //Create infowindow object
  this.infowindow = new google.maps.InfoWindow({
    content: self.contentString
  });

  //Display infowindow on upon marker click event
  this.marker.addListener('click', function() {
    self.contentString = '<h4>' + self.name + '</h4>' + '<p>' + self.formattedAddress + '</p>';
    self.infowindow.setContent(self.contentString);
    self.infowindow.open(map, self.marker);
    self.marker.setAnimation(google.maps.Animation.DROP);
  });

  //Display infowindow upon location list click event
  this.listAnimate = function(locationItem) {
    google.maps.event.trigger(self.marker, 'click');
  };

};


//Declare global variables
var map;
var clientID;
var clientSecret;


var viewModel = function() {
  var self = this;
  this.locationList = ko.observableArray([]);
  this.query = ko.observable("");

  //Initialize FourSquare API authentication information
  clientID = "KCFKT0NSVZOCKNDLTSKPQKIKZ1F0FVMIXJB3ZRSWTVNDKSC4";
  clientSecret = "U3OBFMFWCHYX1MLZK1PYAZ5DZBPWXMTBR2GOKE352LV1NNRO";

  //Initialize Google Maps
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 1.314808, lng: 103.844428},
    zoom: 13
  });

  //Load markers on the map
  locationSet.forEach(function(location) {
    self.locationList.push(new Location(location));
  });

  //Display location markers based on search query
  //Code reference from http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
  this.shownLocantions = ko.computed(function() {
    var searchQuery = self.query().toLowerCase();

    //When searchQuery is null, set all locaiton markers to visible
    if(!searchQuery) {
      self.locationList().forEach(function(location) {
        location.visible(true);
      });
      return self.locationList();
    }
    //When searchQuery is not null, set matched locations to visible
    else {
      return ko.utils.arrayFilter(self.locationList(), function(location) {
        var locationName = location.name.toLowerCase();
        var match = (locationName.search(searchQuery) >= 0);
        location.visible(match);
        return match;
      });
    }
  }, self);
};

//Callback function upon map loading. Initiate map application
var initApp = function() {
  ko.applyBindings(new viewModel());
};

//Error handling for Google Maps failed loading
function googleError() {
  alert("Google Maps didn't load properly. Please refresh the page and try again.");
}
