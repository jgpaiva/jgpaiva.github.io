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
            url : server_link + '/services/translation/' + unbabel_id + "/" + unbabel_user + "/" + unbabel_auth,
            crossDomain: true,
            data : [],
            success : function(data) {
                console.log("got GET reply: " + JSON.stringify(data));
                $("div[unbabel-id='" + unbabel_id + "']").closest("div").html(data['translatedText']);
                button.text("Translated!"); // XXX: can this be a problem? at
                // what time is this bound to the
                // button variable?
            },
            dataType : 'json',
            error : function() {
                alert("Error");
            }
        });
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
            $("#toreplace").attr("unbabel-user",user);
            $("#toreplace").attr("unbabel-auth",data.encryptedHash);
        },
        dataType : 'json',
        error : function(data) {
            console.log("Error: " + JSON.stringify(data));
        }
    });
}

function test(text) {
    console.log(JSON.stringify({
        user : user,
    key : key,
    text : text
    }));
    $.ajax({
        type : "GET",
        crossDomain: true,
        cache: false, 
        url : server_link + "/greeting?name=porra%20tolaaaaaa" ,
        contentType : "application/json",
        success : function(data) {
            console.log("got GET reply: " + JSON.stringify(data));
        },
        dataType : 'json',
        error : function(data) {
            console.log("Error: " + JSON.stringify(data));
        }
    });
}
