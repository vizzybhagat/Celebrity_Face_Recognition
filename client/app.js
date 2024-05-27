Dropzone.autoDiscover = false;
jQuery.support.cors = true;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/",
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Some Message",
        autoProcessQueue: false
    });

    dz.on("addedfile", function() {
        if (dz.files[1]!=null) {
            dz.removeFile(dz.files[0]);
        }
    });

    dz.on("complete", function (file) {
        let imageData = file.dataURL;

        //var url = "http://127.0.0.1:5000/classify_image";     //use this without nginx
        var url = "/api/classify_image";                        //use this with nginx

        $.post(url, {
            image_data: imageData
        },function(data, status) {
            /*
            Below is a sample response if you have two faces in an image lets say natalie and leonardo together.
            Most of the time if there is one person in the image you will get only one element in below array
            data = [
                {
                    class: "natalie_portman",
                    class_probability: [1.05, 12.67, 22.00, 4.5, 91.56],
                    class_dictionary: {
                        angelina_jolie: 0,
                        denzel_washington: 1,
                        leonardo_di_caprio: 2,
                        megan_fox: 3,
                        natalie_portman: 4
                    }
                },
                {
                    class: "leonardo_di_caprio",
                    class_probability: [7.02, 23.7, 52.00, 6.1, 1.62],
                    class_dictionary: {
                        angelina_jolie: 0,
                        denzel_washington: 1,
                        leonardo_di_caprio: 2,
                        megan_fox: 3,
                        natalie_portman: 4
                    }
                }
            ]
            */
            console.log(data);
            if (!data || data.length==0) {
                $("#resultHolder").hide();
                $("#divClassTable").hide();
                $("#error").show();
                dz.removeFile(file);
                return;
            }
            let players = ["angelina_jolie", "denzel_washington", "leonardo_di_caprio", "megan_fox", "natalie_portman"];

            let match = null;
            let bestScore = -1;

            for (let i=0;i<data.length;++i) {
                let maxScoreForThisClass = Math.max(...data[i].class_probability);
                if(maxScoreForThisClass>bestScore) {
                    match = data[i];
                    bestScore = maxScoreForThisClass;
                }
            }
            if (match) {
                $("#error").hide();
                $("#resultHolder").show();
                $("#divClassTable").show();
                $("#resultHolder").html($(`[data-player="${match.class}"`).html());
                let classDictionary = match.class_dictionary;
                for (let personName in classDictionary) {
                    let index = classDictionary[personName];
                    let proabilityScore = match.class_probability[index];
                    let elementName = "#score_" + personName;
                    $(elementName).html(proabilityScore);
                }
            }
            dz.removeFile(file);
        });
    });

    $("#submitBtn").on('click', function (e) {
        dz.processQueue();
    });
}

$(document).ready(function() {
    console.log( "ready!" );
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();

    init();
});
