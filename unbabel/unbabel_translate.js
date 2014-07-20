var server_link = "http://salty-ocean-6766.herokuapp.com" 
//var server_link = "http://localhost:8080";
var user = "jgpaiva";
var key = "jj";

var machineTranslation = '<p style="font-size:70%;color:blue">This text was machine translated through Unbabel.</p>'
var realTranslation = '<p style="font-size:70%;color:blue">This text was translated by humans through Unbabel.</p>'

function reset() {
    $('#translate-button').text("Translate");
    $('#translate-button').attr("disabled", false);
    $('#translate-button').attr("unbabel-id","INVALID");
    $('#translate-button').attr("unbabel-auth","INVALID");
    $('#translate-button').attr("unbabel-user","INVALID");
}

function register_unbabel() {
    $('#translate-button').click(function() {
        unbabel_id = $(this).attr("unbabel-id");
        unbabel_auth = $(this).attr("unbabel-auth");
        unbabel_user = $(this).attr("unbabel-user");
        
        console.log("found button with ID " + unbabel_id + " auth " + unbabel_auth + " user " + unbabel_user);
        $(this).attr("disabled", "disabled");
        $(this).text("Translating... Please wait.");
        button = $(this);
        get_translation(button,unbabel_user,unbabel_id,unbabel_auth,text,true);
    });
}

function get_translation(button, unbabel_user, unbabel_id, unbabel_auth, text, first_request){
    $.ajax({
        type : "GET",
        url : server_link + '/translation/' + unbabel_id + "/" + unbabel_user + "/" + unbabel_auth,
        crossDomain: true,
        data : [],
        success : function(data) {
            console.log("Got GET reply: " + JSON.stringify(data));
            if(data['translatedText']){
                $("div[unbabel-id='" + unbabel_id + "']").closest("div").html(data['translatedText'] + realTranslation);
                button.text("Translated!"); // XXX: can this be a problem? at what time is this bound to the button variable?
            }else{
                unbabel-min_requests = button.attr("unbabel-min_requests");
                if(unbabel-min_requests){
                    console.log("Haven't reached min_requests yet. At: " + unbabel-min_requests);
                    button.attr("unbabel-min_requests", unbabel-min_requests - 1);
                }else{
                    console.log("The translation came back empty, rescheduling.");
                    schedule_get_translation(button,unbabel_user,unbabel_id,unbabel_auth,text);
                }
            }
        },
        dataType : 'json',
        statusCode : {
            500 : function() {
                console.log("Error retrieving translation. Issuing new translation");
                text = $("div[unbabel-id='" + unbabel_id + "']").closest("div").text();
                if(first_request){
                    post_translation(button, unbabel_user, unbabel_id, unbabel_auth, text);
                }else{
                    console.log("Error updating translation, scheduling new operation.");
                    schedule_get_translation(button,unbabel_user,unbabel_id,unbabel_auth,text);
                }
            },
            401 : function() {
                console.log("Error retrieving translation, unauthorized");
                text = $("div[unbabel-id='" + unbabel_id + "']").closest("div").text("ERROR: Unauthorized request.");
                reset();
            }
        }
    });
}

function schedule_get_translation(button,unbabel_user,unbabel_id,unbabel_auth,text){
    setTimeout(function(){get_translation(button,unbabel_user,unbabel_id,unbabel_auth,text,false)},20000);
}

function post_translation(button, unbabel_user, unbabel_id, unbabel_auth, text){
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
            console.log("Got POST reply: " + JSON.stringify(data));
            $("div[unbabel-id='" + unbabel_id + "']").closest("div").html(data['translatedText'] + machineTranslation);
            button.text("Translated!");
            schedule_get_translation(button,unbabel_user,unbabel_id,unbabel_auth,text);
        },
        dataType : 'json',
        error : function(data) {
            $("div[unbabel-id='" + unbabel_id + "']").closest("div").html("ERROR");
            console.log("Error: " + JSON.stringify(data));
            button.text("Translate");
            button.attr("disabled", false);
        }
    });
}


function sign_demo2_text() {
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
            console.log("Got POST reply: " + JSON.stringify(data));
            $("#toreplace").text(text);
            $("#toreplace").attr("unbabel-id",data.hash);
            $("#translate-button").attr("unbabel-id",data.hash);
            $("#translate-button").attr("unbabel-user",user);
            $("#translate-button").attr("unbabel-auth",data.encryptedHash);
            $("#sign_text").text("added signature for user " + user + " with hash " + data.hash + " and signature " + data.encryptedHash);
        },
        dataType : 'json',
        error : function(data) {
            console.log("Error: " + JSON.stringify(data));
        }
    });
}

function sign_demo3_text() {
    user = document.user.text.value;
    key = document.key.text.value;
    text = document.text.text.value;
    min_requests = document.min_requests.text.value;

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
            console.log("Got POST reply: " + JSON.stringify(data));
            $("#toreplace").text(text);
            $("#toreplace").attr("unbabel-id",data.hash);
            $("#translate-button").attr("unbabel-id",data.hash);
            $("#translate-button").attr("unbabel-user",user);
            $("#translate-button").attr("unbabel-auth",data.encryptedHash);
            $("#translate-button").attr("unbabel-min_requests",data.encryptedHash);
            $("#sign_text").text("added signature for user " + user + " with hash " + data.hash + " and signature " + data.encryptedHash);
        },
        dataType : 'json',
        error : function(data) {
            console.log("Error: " + JSON.stringify(data));
        }
    });
}
