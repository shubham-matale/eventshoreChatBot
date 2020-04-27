# /index.py
#Name: Event Shore Chatbot
#Version: v1.0.0
#Developer: Pratik Mahamuni, AcknowTech
#Support: pratik.mahamuni@acknowtech.in | pratikraj.mahamuni@gmail.com


from flask import Flask, request, jsonify, render_template
from google.protobuf.json_format import MessageToJson,MessageToDict
from array import array
import numpy as np

# from flask_mysqldb import MySQL
import os
import dialogflow
import requests
import json
import pusher
import mysql.connector

app = Flask(__name__)

mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    passwd="",
    database="eventshore"
)
categories_cursor = mydb.cursor()
categories_cursor.execute("SELECT category FROM categories")
categories = list(categories_cursor.fetchall())
final_categories = [i[0] for i in categories]

cities_cursor = mydb.cursor()
cities_cursor.execute("SELECT distinct(location) FROM events")
cities = list(cities_cursor.fetchall())
final_cities = [i[0] for i in cities]

events_cursor = mydb.cursor()
events_cursor.execute("SELECT name FROM events")
events_data = list(events_cursor.fetchall())
final_events_data = [i[0] for i in events_data]

booked_tickets_cursor = mydb.cursor()
booked_tickets_cursor.execute("SELECT unique_id FROM booked_tickets")
booked_tickets = list(booked_tickets_cursor.fetchall())
final_booked_tickets = [i[0] for i in booked_tickets]

dict_keys = ['buttons']

categories_dict = {}
cities_dict = {}
events_dict = {}

cityname = ""

@app.route('/')
def index():
    return render_template('index.html')
# run Flask app
if __name__ == "__main__":
    app.run()

@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.get_json(silent=True)
    if data['queryResult']['queryText'] == 'yes':
        reply = {
            "fulfillmentText": "Ok. Tickets booked successfully.",
        }
        return jsonify(reply)

    elif data['queryResult']['queryText'] == 'no':
        reply = {
            "fulfillmentText": "Ok. Booking cancelled.",
        }
        return jsonify(reply)

def detect_intent_texts(project_id, session_id, text, language_code):
    session_client = dialogflow.SessionsClient()
    session = session_client.session_path(project_id, session_id)
    bot_message = []
    payload_data = []
    if text:
        text_input = dialogflow.types.TextInput(text=text, language_code=language_code)
        query_input = dialogflow.types.QueryInput(text=text_input)
        response = session_client.detect_intent(session=session, query_input=query_input)

        json_obj = MessageToJson(response.query_result)
        json.loads(json_obj)
        if "payload" in json_obj:
            json_data = response.query_result.fulfillment_messages[1].payload.fields['buttons'].list_value.values

            for i in range(0,len(json_data)):
                payload_data.append(response.query_result.fulfillment_messages[1].payload.fields['buttons'].list_value.values[i].string_value)
            return response.query_result.fulfillment_text,payload_data

        if "Please select the city name" in json_obj:
            return response.query_result.fulfillment_text,final_cities   
        if "Please select the category" in json_obj:
            return response.query_result.fulfillment_text,final_categories
        if "Please select the event" in json_obj:
            city_value = response.query_result.parameters.fields['city'].string_value
            category_value = response.query_result.parameters.fields['category'].string_value
            queryEventName = ("SELECT name FROM events where location=%s and category=%s")
            events_cursor.execute(queryEventName, (city_value, category_value))
            events = list(events_cursor.fetchall())
            final_events = [i[0] for i in events]
    
            return response.query_result.fulfillment_text,final_events 
        
        if response.query_result.query_text in final_events_data:    
            
            event_name = response.query_result.query_text

            queryEventInfo = ("SELECT address,date,time FROM events where name=%s")
            events_cursor.execute(queryEventInfo, (event_name,))
            events_info = list(events_cursor.fetchall())
            final_events_info = [i[0] for i in events_info]
            final_events_info_data = [i for j in events_info for i in j]
            
            return response.query_result.fulfillment_text,final_events_info_data   
        global reference_id
        global copy_response
        copy_response = None

        if "Cancel a ticket" in response.query_result.query_text:
            pass
        else:
            if response.query_result.query_text in final_booked_tickets:
                cancel_confirmation = ['Yes! I am Sure','No']    
                       
                copy_response = response.query_result.query_text    
                reference_id = response.query_result.query_text

                queryDisplayTicket = ("SELECT unique_id FROM booked_tickets where unique_id=%s")
                booked_tickets_cursor.execute(queryDisplayTicket, (reference_id,))
                DisplayTicket = list(events_cursor.fetchall())
                final_DisplayTicket = [i[0] for i in DisplayTicket]
 
                return response.query_result.fulfillment_text,cancel_confirmation
            
            elif "Yes! I am Sure" in response.query_result.query_text or "No" in response.query_result.query_text:
                pass
            elif response.query_result.query_text not in final_booked_tickets:
                resubmit_refernceid = ['Cancel a ticket','No, Thank You!']
                
                return "You have entered the wrong Reference ID",resubmit_refernceid

        if "Yes! I am Sure" in response.query_result.query_text:
            queryDeleteTicket = ("DELETE FROM booked_tickets where unique_id=%s")
            booked_tickets_cursor.execute(queryDeleteTicket, (reference_id,))
            mydb.commit()
        return response.query_result.fulfillment_text
        


@app.route('/send_message', methods=['POST'])
def send_message():
    message = request.form['message']
    project_id = os.getenv('DIALOGFLOW_PROJECT_ID')
    fulfillment_text = detect_intent_texts(project_id, "unique", message, 'en')    
    response_text = { "message":  fulfillment_text }
    return jsonify(response_text)
