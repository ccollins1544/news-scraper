function hbsHelpers(hbs) {
  return hbs.create({
    helpers: { 
      ifObject: function(item, options){
        try {
          item = JSON.parse(item);
          if(typeof item === "object") {
            return options.fn(this);
          } else {
            return options.inverse(this);
          }
        }catch(e){
          return options.inverse(item);
        }
      },

      withItem: function(object, options) {
        object = JSON.parse(object);
        return options.fn(object[options.hash.key]);
      },

      isZero: function(item, options){
        try {
          if(item){
            return options.inverse(this);
          }else{
            return options.fn(this);  
          }
        }catch(e){
          return options.inverse(item);
        }
      }

    },
    defaultLayout: "main"
  });
}

module.exports = hbsHelpers;
