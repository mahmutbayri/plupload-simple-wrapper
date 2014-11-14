/*!
* Plupload Simple Wrapper
* https://github.com/kalimba/plupload-simple-wrapper
*
* Released under the MIT license
*/
(function($){

var makeid = function()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

$.PluploadSimpleWrapper = function(element, options)
{
    var defaults = {
        browseButtonText: 'Browse File',
        progressInfo: null
    };

    var plugin = this;
    plugin.settings = {};

    var $element = $(element),
        uniqueMakeid = makeid();

    plugin.settings = $.extend({}, defaults, options);

    var consoleContainer = $('<div id="plupload_console_' + uniqueMakeid + '"><\/div>');
    var pickButton = $('<span  id="plupload_browse_' + uniqueMakeid + '">' + plugin.settings.browseButtonText +'<\/span>');

    $element.html(consoleContainer);
    $element.append(pickButton);

    var showMessage = function(message)
    {
        consoleContainer.html(message);

        setTimeout(function(){
            consoleContainer.empty();
        }, 2e3);

    };

    var pluploadOptions = {
        runtimes : 'html5',
        container: $element.get(0),
        browse_button: pickButton.get(0),
        url: plugin.settings.url,
        multi_selection: false,
        filters : {
            max_file_size : '10mb',
            mime_types: [
                {title : "Image files", extensions : "jpg"}
            ]
        },
        init: {
            PostInit: function(up){},
            BeforeUpload: function(up, file) {
                if($.isFunction(plugin.settings.progressInfo))
                {
                    plugin.settings.progressInfo(up, file);
                }
            },
            FilesAdded: function(up, files)
            {
                if (up.files.length == 2)
                {
                    up.removeFile(up.files[0]);
                }

                $.each(files, function(i, file) {
                    consoleContainer.html(file.name + ' (' + plupload.formatSize(file.size) + ') <b></b>');
                });

                up.refresh();
                up.start();
            },

            UploadComplete: function(file)
            {
                showMessage('Completed');
            },

            UploadProgress: function(up, file)
            {
                if($.isFunction(plugin.settings.progressInfo))
                {
                    plugin.settings.progressInfo(up, file);
                    return;
                }

                consoleContainer.find("b").html(file.percent + '%');
            },

            StateChanged: function(up){
                if(up.state == plupload.STARTED){
                    pickButton.hide();
                }else if(up.state == plupload.STOPPED){
                    pickButton.show();
                }
            },

            Error: function(up, args) {
                showMessage(args.message);
            }
        }
    };

    var uploader = new plupload.Uploader(pluploadOptions);
    uploader.init();

    plugin.uploader = uploader;
};

$.fn.PluploadSimpleWrapper = function(options)
{
    return this.each(function(){
        if (undefined == $(this).data('uploaderWrapper')) {
            var uploaderObj = new $.PluploadSimpleWrapper(this, options);
            $(this).data('PluploadSimpleWrapper', uploaderObj);
        }
    });
};

}(jQuery));