//var server_link = "http://salty-ocean-6766.herokuapp.com" 
var server_link = "http://localhost:8080";
var user = "jgpaiva";
var key = "jj";

function register_unbabel() {
    $('#translate-button').click(function() {
        unbabel_id = $(this).attr("unbabel-id");
        unbabel_auth = $(this).attr("unbabel-auth");
        unbabel_user = $(this).attr("unbabel-user");
        console.log("found button with ID " + unbabel_id + " auth " + unbabel_auth + " user " + unbabel_user);
        $(this).attr("disabled", "disabled");
        $(this).text("Translating... Please wait.");
        button = $(this);
        $.ajax({
            type : "GET",
            url : server_link + '/translation/' + unbabel_id + "/" + unbabel_user + "/" + unbabel_auth,
            crossDomain: true,
            data : [],
            success : function(data) {
                console.log("Got GET reply: " + JSON.stringify(data));
                $("div[unbabel-id='" + unbabel_id + "']").closest("div").html(data['translatedText']);
                button.text("Translated!"); // XXX: can this be a problem? at what time is this bound to the button variable?
            },
            dataType : 'json',
            error : function() {
                console.log("Error retrieving translation. Issuing new translation");
                text = $("div[unbabel-id='" + unbabel_id + "']").closest("div").text();
                issue_translation(button, unbabel_user, unbabel_id, unbabel_auth, text);
            }
        });
    });
}

function issue_translation(button,unbabel_user, unbabel_id, unbabel_auth, text){
    $.ajax({
        type : "POST",
        crossDomain: true,
        url : server_link + '/translation/',
        data : JSON.stringify({
            uid : unbabel_id,
            signature : unbabel_auth,
            sourceLanguage : "en",
            destLanguage: "pt",
            text: text,
            user: user
            }),
        cache: false, 
        contentType : "application/json",
        success : function(data) {
            console.log("got POST reply: " + JSON.stringify(data));
            $("div[unbabel-id='" + unbabel_id + "']").closest("div").html(data['translatedText']);
            button.text("Translated!");
        },
        dataType : 'json',
        error : function(data) {
            console.log("Error: " + JSON.stringify(data));
            button.text("Error!");
        }
    });
}


function sign_demo_text() {
    user = document.user.text.value;
    key = document.key.text.value;
    text = document.text.text.value;

    console.log(JSON.stringify({
        user : user,
        key : key,
        text : text
    }));
    $.ajax({
        type : "POST",
        crossDomain: true,
        url : server_link + '/sign/',
        data : JSON.stringify({
            user : user,
        key : key,
        text : text
        }),
        cache: false, 
        contentType : "application/json",
        success : function(data) {
            console.log("got POST reply: " + JSON.stringify(data));
            $("#toreplace").text(text);
            $("#toreplace").attr("unbabel-id",data.hash);
            $("#translate-button").attr("unbabel-id",data.hash);
            $("#translate-button").attr("unbabel-user",user);
            $("#translate-button").attr("unbabel-auth",data.encryptedHash);
        },
        dataType : 'json',
        error : function(data) {
            console.log("Error: " + JSON.stringify(data));
        }
    });
}
