var payload_values = [];
var payload_values_url = [];
var city_names = [];
var category_names = [];
var event_names = [];

var city = "";
var category = "";
var event = "";

var book_an_event = false;
var event_info = false;

var payload_values_temp = [];

var reference_id = "";

function hi_to_bot(msg) 
{
  book_an_event = false;
  event_info = false;
  $("#input_message").val(msg).submit();  
}

function payload_value_human(i) 
{
  $("#input_message").val(payload_values[i]).submit();
  
  if(payload_values[i].includes(city_names))
  {
    city = payload_values[i];
  }
  else if(payload_values[i].includes(category_names))
  {
    category = payload_values[i];
  }
  else if(payload_values[i].includes(event_names))
  {
    event = payload_values[i];
  }

  if(payload_values[i].includes("Book an event"))
  {
    book_an_event = true;
  }
}
function anything_else()
{

    $('.chat-container').append(`
        <div class="chat-message bot-message">
            Anything else I can help you with?
        </div>
      `)
      // remove the loading indicator
      $( "#loading" ).remove();

      $('.chat-container').append(
          `<div class="chat-message"><button type="button" class="btn btn-rounded btn-outline-primary" 
            id="anything_else_yes" value="yes" onclick="hi_to_bot('Yes');">
            Yes</button></div>`)

      $( "#loading" ).remove();

      $('.chat-container').append(
          `<div class="chat-message"><button type="button" class="btn btn-rounded btn-outline-primary" 
            id="anything_else_no" value="no" onclick="anything_else_no()">
            No</button></div>`)

      $( "#loading" ).remove();

      book_an_event = false;
      event_info = false;
}

function anything_else_no() 
{
    $("#input_message").val('No').submit();
}

function submit_message(message) 
{
  $.post( "/send_message", {message: message}, handle_response);
  function handle_response(data) 
  {
    if (data.message.length==2) 
    {
        $('.chat-container').append(`
          <div id="bot_msg_id" class="chat-message bot-message">
              ${data.message[0]}
          </div>
        `)
        $( "#loading" ).remove(); 

        if(data.message[0].includes("Please select the city name"))
        {
            payload_values = [];
            payload_values_temp = payload_values;
            for (var i = 0; i < data.message[1].length; i++) 
            {
                payload_values.push(data.message[1][i]);
            }    
        }

        if(data.message[0].includes("Please select the event"))
        {
            payload_values = [];
            button_id = [];
            if(data.message[1].length == 0)
            {
                $('.chat-container').append(`
                  <div id="sorry-no-events" class="chat-message bot-message" style="background: red;
                      border-radius: 10px; width:250px">
                      Sorry! No events are available. 
                  </div>
                `)
                $( "#loading" ).remove();

                anything_else();   
            }  

            for (var i = 0; i < data.message[1].length; i++) 
            {
                event_names.push(data.message[1][i]);
                payload_values.push(data.message[1][i]);
                button_id.push(data.message[1][i].replace(/\s/g,''));
                $('.chat-container').append(
                  `<div class="chat-message"><button class="btn btn-info btn-rounded btn-outline-primary" role="button" 
                    id="`+button_id[i]+`" value=" `+payload_values_url[i]+`" onclick="payload_value_human(`+i+`);">
                    ${data.message[1][i]}</button></div>`)

                $( "#loading" ).remove();
            }
        } 
        else if(data.message[0].includes("Please select the category") && book_an_event == true)
        {
            button_id = [];
            payload_values_url = [];
            for (var i = 0; i < data.message[1].length; i++) 
            {
                payload_values_url.push(data.message[1][i]);
                button_id.push(data.message[1][i].replace(/\s/g,''));
                $('.chat-container').append(
                  `<div class="chat-message"><button class="btn btn-info btn-rounded btn-outline-primary" role="button" 
                    id="`+button_id[i]+`" value=" `+payload_values_url[i]+`" onclick="window.open('http://localhost/BE%20Project(EVENTSHORE)/viewall.php?cat=`+payload_values_url[i]+`&city=`+city+`');anything_else();">
                    ${data.message[1][i]}</button></div>`)

                $( "#loading" ).remove();

            }
        }  
        else if (data.message[0].length == 0) 
        {
            document.getElementById("bot_msg_id").style.display = "none";
               
            button_id = [];
            payload_values = [];
            payload_values_temp = payload_values;
            for (var i = 0; i < data.message[1].length; i++) 
            {
                payload_values.push(data.message[1][i]);
                button_id.push(data.message[1][i].replace(/\s/g,''));
            }
           
            $('.chat-container').append(
              `<div class="chat-message">
                  <div class="card">
                    <div class="chat-message bot-message">Event Details:</div>
                    <div class="container">
                      <b>Venue: ${data.message[1][0]}<br>
                      Date: ${data.message[1][1]}<br>
                      Time: ${data.message[1][2]}</b>
                    </div>
                  </div>
                </div>`)

              $( "#loading" ).remove();
            
            anything_else();
        } 
        else
        {
          button_id = [];
          payload_values = [];
          payload_values_temp = payload_values;
          $('.chat-container').append(
                `<div id="chat-message-buttons" class="chat-message"></div>`)
          for (var i = 0; i < data.message[1].length; i++) 
          {
              payload_values.push(data.message[1][i]);
              button_id.push(data.message[1][i].replace(/\s/g,''));
              $('#chat-message-buttons').append(
                `<div class="remove-div chat-message"><button type="button" class="chat-message btn btn-rounded btn-outline-primary" 
                  id="`+button_id[i]+`" value=" `+payload_values[i]+`" onclick="payload_value_human(`+i+`);">
                  ${data.message[1][i]}</button></div>`)

            $( "#loading" ).remove();

          } 

          $("#Bookanevent").click(function()
          {
             book_an_event = true;
          });

          $("#Eventinformation").click(function()
          {
             event_info = true;
          }); 

          element = $(".remove-div");

          for (var i in element) 
          {
            element.on('click', function() {
              $(this).parent().remove();
            });
          }
        }  
    }
    else
    {
        var ref_value="";
        $('.chat-container').append(`
          <div class="chat-message bot-message">
              ${data.message}
          </div>
        `)
         $( "#loading" ).remove();
        
        if(data.message.includes("Enter the Reference ID") || data.message.includes("Please enter the correct reference ID")) 
        {
            var x = document.getElementById("input_message").style.display = 'block';
        }
        else if(data.message.includes("Please confirm") && data.message.includes("You have entered the wrong Reference ID"))
        {
            var x = document.getElementById("input_message").style.display = 'none';
        }
        else
        {
            var x = document.getElementById("input_message").style.display = 'none';
        }
        
      }

  }      
}



$('#target').on('submit', function(e)
{
  e.preventDefault();
  const input_message = $('#input_message').val()
  // return if the user does not enter any text
  if (!input_message) {
    return
  }

  $('.chat-container').append(`
      <div class="chat-message col-md-7 human-message">
          ${input_message}
      </div>
  `)

  // loading 
  $('.chat-container').append(`
      <div class="chat-message text-center col-md-2 offset-md-10 bot-message" id="loading">
          <b>...</b>
      </div>
  `)

  // clear the text input 
  $('#input_message').val('')

  // send the message
  submit_message(input_message)
});


//=---------------------------------------------------------------------------
