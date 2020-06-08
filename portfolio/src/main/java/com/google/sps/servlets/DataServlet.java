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

package com.google.sps.servlets;

import java.io.IOException;
import com.google.gson.Gson;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;
import java.util.regex.*;
import java.util.stream.*;
import java.util.Set;
import java.util.LinkedHashSet;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;

/** Servlet that returns some example content.*/
@WebServlet("/data")
public class DataServlet extends HttpServlet {
  
  private DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
  private final String COMMENT = "Comment";

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Query query = new Query(COMMENT).addSort("timestamp", SortDirection.DESCENDING);
    List<Comment> comments = new ArrayList<Comment>();
    PreparedQuery results = datastore.prepare(query);
    
    for (Entity entity : results.asIterable()) {
      String comment = (String) entity.getProperty("comment");
      String image = (String) entity.getProperty("image");
      String name = (String) entity.getProperty("name");
      Comment current = new Comment(name, comment, image);
      comments.add(current);
    }
    Set<Comment> filteredComments = match(request.getParameter("searchTerm"), comments);
	
    Gson gson = new Gson();
    response.setContentType("application/json");
    response.getWriter().println(gson.toJson(filteredComments));
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String newComment = request.getParameter("comment");
    String profileToken = request.getParameter("profile-token");
    GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), JacksonFactory.getDefaultInstance())
      .setAudience(Collections.singletonList("895229822158-fr752h2bo6ffm0sglk14uilv4u0aq9vi.apps.googleusercontent.com")).build();
    GoogleIdToken token = null;
	
    String fullName;
    String image;
    try {
	  token = verifier.verify(profileToken);
      Payload payload = token.getPayload();
      fullName = (String) payload.get("name");
      image = (String) payload.get("picture");
    } 
    catch (Exception e) {
      fullName = "Anonymous";
      image = "/images/blank.png";
    }

    long timestamp = System.currentTimeMillis();
    Entity commentEntity = new Entity(COMMENT);
    commentEntity.setProperty("comment", newComment);
    commentEntity.setProperty("timestamp", timestamp);
    commentEntity.setProperty("name", fullName);
    commentEntity.setProperty("image", image);
    datastore.put(commentEntity);
    response.sendRedirect("/contact.html");
  }
  
  /**
  * Completes modified fuzzy search given a searchTerm and a list of comments
  */
  private Set<Comment> match(String searchTerm, List<Comment> comments) {
    //List<Comment> matches = new ArrayList<Comment>();
    Set<Comment> matches = new LinkedHashSet<>();
    String term = searchTerm.toLowerCase();

    //Exact match
    Set<Comment> commentsCopy = new LinkedHashSet<Comment>(comments);
    Set<Comment> exactMatches = commentsCopy.stream().filter(comment -> comment.getLowerCaseText().contains(term))
      .collect(Collectors.toSet());
    matches.addAll(exactMatches);

    for(Comment comment: comments) {
      String text = comment.getLowerCaseText();
      for(int i=0; i< term.length(); i++) {
        //Insert each letter in the alphabet
        String inserted = "[.]*" + term.substring(0,i) + "." + term.substring(i) + "[.]*";
        if(Pattern.matches(inserted, text)) {
          matches.add(comment);
        }
        //Swap out letter with letter from alphabet
        if (i<term.length()-1) {
          String swapped = "[.]*" + term.substring(0,i) + "." + term.substring(i+1) + "[.]*";
          if (Pattern.matches(swapped, text)) {
            matches.add(comment);
          } 
        }
      }

      for(int i=1; i<term.length(); i++) {
        //Swap adjacent letters
        String swapAdjacent = "[.]*" + term.substring(0,i-1) + term.charAt(i) + term.charAt(i-1);
        if (i<term.length()-1) {
          swapAdjacent += term.substring(i+1) + "[.]*";
        }
        if(Pattern.matches(swapAdjacent, text)) {
          matches.add(comment);
        }
        
        //Delete each letter
        String deleted = "[.]*" + term.substring(0,i);
        if(i<term.length()-1) {
          deleted += term.substring(i+1) + "[.]*";
        }
        String deleteFirst = "[.]*" + term.substring(1) + "[.]*";
        if(Pattern.matches(deleted, text) || Pattern.matches(deleteFirst, text)) {
          matches.add(comment);
        }
      }
    }
    return matches;
  }
}
