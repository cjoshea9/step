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
    Gson gson = new Gson();
    response.setContentType("application/json");
    response.getWriter().println(gson.toJson(comments));
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
}
