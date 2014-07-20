var server_link = "http://salty-ocean-6766.herokuapp.com" 
//var server_link = "http://localhost:8080";
var user = "jgpaiva";
var key = "jj";

var machineTranslation = '<p style="font-size:70%;color:blue">This text was machine translated through Unbabel.</p>';
var realTranslation = '<p style="font-size:70%;color:blue">This text was translated by humans through Unbabel.</p>';
var placeholder = 'PLACEHOLDER TEXT, IN PLACE OF IMMEDIATE AUTOMATIC TRANSLATION';
var waitForTranslation = '<p style="font-size:70%;color:blue">This text was machine translated through Unbabel.<br/>Please wait for human translation, should take a few minutes...</p>';
var crowdSource = "Crowd source this translation";

function reset() {
    $('#translate-button').text("Translate");
    $('#translate-button').attr("disabled", false);
    $('#translate-button').attr("unbabel-id","INVALID");
    $('#translate-button').attr("unbabel-auth","INVALID");
    $('#translate-button').attr("unbabel-user","INVALID");
    $('#translate-button').removeAttr("crowdsource");
}

function register_unbabel() {
    $('#translate-button').click(function() {
        unbabel_id = $(this).attr("unbabel-id");
        unbabel_auth = $(this).attr("unbabel-auth");
        unbabel_user = $(this).attr("unbabel-user");
        text = $("div[unbabel-id='" + unbabel_id + "']").closest("div").text();
        
        console.log("found button with ID " + unbabel_id + " auth " + unbabel_auth + " user " + unbabel_user);
        $(this).attr("disabled", "disabled");
        $(this).text("Translating... Please wait.");
        button = $(this);
        if($(this).attr('crowdsource')){
            window.open("http://jgpaiva.github.io/unbabel/demo_crowd.html");
        }else{
            get_translation(button,unbabel_user,unbabel_id,unbabel_auth,text,true);
        }
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
                console.log("The translation came back empty, rescheduling.");
                schedule_get_translation(button,unbabel_user,unbabel_id,unbabel_auth,text);
            }
        },
        dataType : 'json',
        statusCode : {
            500 : function() {
                console.log("Error retrieving translation. Issuing new translation");
                if(first_request){
                    unbabel_min_requests = button.attr("unbabel-min_requests");
                    post_translation(button, unbabel_user, unbabel_id, unbabel_auth, text, unbabel_min_requests);
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

function post_translation(button, unbabel_user, unbabel_id, unbabel_auth, text, unbabel_min_requests){
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
            user: user,
            minRequests: unbabel_min_requests
            }),
        cache: false, 
        contentType : "application/json",
        success : function(data) {
            console.log("Got POST reply: " + JSON.stringify(data));
            if(data.status == "requested"){
                console.log("Translation was requested. Scheduling periodic gets.");
                schedule_get_translation(button,unbabel_user,unbabel_id,unbabel_auth,text);
                $("div[unbabel-id='" + unbabel_id + "']").closest("div").html(data['translatedText'] + waitForTranslation);
                button.text("Translated!");
            }else if(data.status == "ignored"){
                console.log("Translation request was ignored. Avoiding scheduling requests.");
                $("div[unbabel-id='" + unbabel_id + "']").closest("div").html(data['translatedText'] + machineTranslation);
                button.text(crowdSource);
                button.attr('crowdsource',true);
                button.attr("disabled",false);
            }
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
    reset()

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
    reset()

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
            $("#translate-button").attr("unbabel-min_requests",min_requests);
            $("#sign_text").text("added signature for user " + user + " with hash " + data.hash + " and signature " + data.encryptedHash);
        },
        dataType : 'json',
        error : function(data) {
            console.log("Error: " + JSON.stringify(data));
        }
    });
}
