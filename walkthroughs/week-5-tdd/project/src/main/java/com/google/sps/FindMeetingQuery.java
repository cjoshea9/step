// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps;

import java.util.Collection;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;

public final class FindMeetingQuery {
  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {
    //Check to make sure meeting time can fit into the day
    if (request.getDuration()>1440) {
      return new ArrayList<>();
    }
    
    //Figure out all times that events are happening of the attendees of the meeting
    List<String> attendees = new ArrayList<>(request.getAttendees());
    List<TimeRange> meetingTimes = new ArrayList<>(); 
    for (Event event : events) {
      TimeRange eventTime = event.getWhen();
      for (String attendee : attendees) {
        if (event.getAttendees().contains(attendee) && !meetingTimes.contains(eventTime)) {
          meetingTimes.add(eventTime);
        }
      }
    }

    List<TimeRange> availableTimes = new ArrayList<>();
    //Make sure there are events for the day
    if (meetingTimes.size()==0){
      return Arrays.asList(TimeRange.WHOLE_DAY);
    }

    //Add from beginning of day to first event 
    int beginDay = meetingTimes.get(0).start();
    if (beginDay >0) {
      availableTimes.add(TimeRange.fromStartDuration(0, beginDay));
    }
    
    //Check if there are times between the events in the day 
    int dayEnd = meetingTimes.get(0).end();
    for (int i = 0; i<meetingTimes.size()-1; i++) {
      TimeRange currentMeeting = meetingTimes.get(i);
      TimeRange nextMeeting = meetingTimes.get(i+1);
      int timeBetweenMeetings = nextMeeting.start() - currentMeeting.end();

      if ( timeBetweenMeetings >= request.getDuration()) {
        TimeRange available = TimeRange.fromStartDuration(currentMeeting.end(), timeBetweenMeetings);
        availableTimes.add(available);
      }
      if(nextMeeting.end()>dayEnd) {
        dayEnd = nextMeeting.end();
      }
    }

    //Add time from end of last meeting to end of the day
    if (dayEnd < TimeRange.END_OF_DAY) {
      availableTimes.add(TimeRange.fromStartDuration(dayEnd, TimeRange.END_OF_DAY-dayEnd+1));
    }

    return availableTimes;
  }
}
