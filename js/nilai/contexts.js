nilai.context     = {};
nilai.current_tab = {};

nilai.context.check = function()
{
    nilai.ajax(nilai.paths.check, 'url=' + nilai.urlEncode(nilai.current_tab.url), 'GET', nilai.context.save, nilai.context.save);
};

// Handle the clicky clicks
nilai.context.chelseaHandler = function(info, tab)
{
    var is_page = (info.linkUrl === undefined) ? true : false;

    // For now only save pages
    // No easy way to get the link's page title
    if (tab && is_page === true) {
        nilai.current_tab = tab;
        nilai.ajax(nilai.paths.ping, '', 'GET', nilai.context.check, nilai.context.fail);
        //console.log("item " + info.menuItemId + " was clicked");
        //console.log("info: " + JSON.stringify(info));
        //console.log("tab: " + JSON.stringify(tab));

    }
};

nilai.context.fail = function(obj)
{
    var status = obj.status || -1;
    var err    = (status == '500' || status == '404' || obj.error === undefined) ? 'We could not save this page.' : (status == '403') ? 'Please log into your account first and then try again.' : obj.err;
    status     = (status > 0 && status != '403') ? ' (' + status + ')' : '';
    nilai.context.pushMessage('error', err + status);
};

nilai.context.pushMessage = function(type, msg)
{
    type = (type == 'error') ? 'Error' : (type == 'success') ? 'Success' : 'Notice';
    msg  = type + ': ' + msg;
    chrome.tabs.sendMessage(nilai.current_tab.id, {'message': msg, 'screen_width': nilai.current_tab.width, 'screen_height': nilai.current_tab.height, 'type': type.toLowerCase()}, function() {});

    var color = (type == 'Error') ? '#ff0000' : '#000000';
    var text  = (type == 'Error') ? 'ERR' : 'OK';
    chrome.browserAction.setBadgeBackgroundColor({'color': color});
    chrome.browserAction.setBadgeText({'text': text});

    var timer = setTimeout(function()
    {
        chrome.browserAction.setBadgeText({'text': ''});
    }, 2500);
};

nilai.context.save = function(obj)
{
    if (obj.mark) {
        nilai.context.pushMessage('notice', 'This page already exists in your account.');
    }
    else {
        var url   = nilai.current_tab.url;
        var title = nilai.current_tab.title;
        var query = 'url=' + nilai.urlEncode(url) + '&title=' + nilai.urlEncode(title) + '&notes=' + nilai.urlEncode('#chrome');
        nilai.ajax(nilai.paths.add, query, 'POST', nilai.context.success, nilai.context.fail);
    }
};

nilai.context.success = function(obj)
{
    //console.log(ibj);
    if (obj.errors) {
        for (var i in obj.errors) {
            nilai.context.pushMessage('error', {'err': obj.errors[i], 'status': i});
            break;
        }
    }
    else if (obj.mark) {
        nilai.context.pushMessage('success', 'This page has been saved to Nilai.');
    }
    else {
        nilai.context.pushMessage('error', {});
    }
};

/*
// Removed for now
chrome.contextMenus.create(
{
    'title'               : 'Save link to Nilai',
    'documentUrlPatterns' : ['http://*', 'https://*'],
    'contexts'            : ['link'],
    'onclick'             : nilai.context.chelseaHandler
});
*/

chrome.contextMenus.create(
{
    'title'               : 'Quick save to Nilai',
    'documentUrlPatterns' : ['http://*/*', 'https://*/*'],
    'contexts'            : ['page'],
    'onclick'             : nilai.context.chelseaHandler
});