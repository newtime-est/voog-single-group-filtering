/*
  Uses voog API, ICanHaz Moustache and jquery

  Clickable filter item has to have a data attribute with the attribute being the table fields code and value being the fields value(ie. data-country="estonia"). "country" being the fields code.
*/

var filterAttributes = {
  modelID: 1940,
  containerClass: 'ich-elements-list',
  elementClass: 'js-filter-item',
  activeClass: 'active', //ElementClasses "active" class
};

getFilters(filterAttributes);

//Does something after getFilters ajax passes, Inside of it is customizable.
function onFilterAjaxSuccess(data, containerClass) {
  $('.'+containerClass).append(ich.ichElementsList({items: data}));
}

//Click event
$('body').on('click','.js-filter-item', function() {
  clickHander({
    clickedElement: $(this),
    activeClass: 'active', //ElementClasses "active" class, should be same as filterAttributes activeClass
    activeElement: 'js-filter-item.active', //ElementClass with "active" class
  });
});


/* ------------------------------------------------------------ */


//On element click filtering
function clickHander(options) {
  if ($(options.clickedElement).hasClass(options.activeClass)) {
      $(options.clickedElement).removeClass(options.activeClass);
  } else {
      $(options.clickedElement).addClass(options.activeClass);
  }

  var filters = {};
  $('.'+options.activeElement).each(function(i, obj) {
      selectedItem = $(obj).data();
      for (var key in selectedItem) {
          var selectedItemVal = '|' + selectedItem[key];
          // var selectedItemKey = key + '=';
          if (!filters.hasOwnProperty(key)) {
              filters[key] = '';
          }
          filters[key] += selectedItemVal;
      }
  });

  var baseUrl = window.location.href.split('#')[0];
  if ($.param(filters)) {
      window.location.replace( baseUrl + '#' + $.param(filters));
  } else {
      window.location.hash = 'noFilter';
  }
  getFilters(filterAttributes);

}

//Main function
function getFilters(options) {
  var allFilters = getQueryVariables();
  var url = '/admin/api/elements?element_definition_id='+ options.modelID +'&per_page=250&include_values=true&language_code={{ page.language_code }}';
  $('.'+options.containerClass).empty();
  if (!$.isEmptyObject(allFilters)) {

    for (var key in allFilters) {
        var curFilter = [
                key,
                allFilters[key]
            ],
            curFilterValues = curFilter[1].split('|'),
            curFiltertypes = curFilter[0];

        for (var j = 0; j < curFilterValues.length; j++) {
            if (j == 0) continue;
            $(''+ '.'+options.elementClass +'[data-' + curFilter[0] + '="' + curFilterValues[j] + '"]').addClass(options.activeClass);
            url += '&q.element.values.' + curFilter[0] + '.$eq[]=' + curFilterValues[j];
        }
    }

  }

  $.ajax({
      url: url,
      method: 'get',
      success: function(response){
          onFilterAjaxSuccess(response, options.containerClass);
      }
  });

}


/* Dependancyfunctions */


//Retrieves hash variables
function getQueryVariables() {
    if (!location.hash) return {};
    var items = location.hash.substr(1).split("&"),
        ret = {},
        tmp,index,found,levels;
    for (var i = 0; i < items.length; i++) {
        tmp = items[i].split("=");
        tmp[0] = decodeURIComponent(tmp[0]).split(']').join('');
        tmp[1] = decodeURIComponent((tmp[1]+ '').replace(/\+/g, '%20'));
        parseSubObject(ret, tmp[0], tmp[1]);
    }
    return ret;
}

//Required to make qetQueryVariable function work
function parseSubObject(accu, string, value) {
    var index = string.indexOf('['),
        key = string,
        tmp;
    if (index === -1) {
        accu[key] = value;
        return;
    }
    key = string.substr(0,index);
    if (!accu[key]) {
        accu[key] = {};
    }
    console.log(parseSubObject(accu[key],string.substr(index+1),value));
    parseSubObject(accu[key],string.substr(index+1),value);
}
