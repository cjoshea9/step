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
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;

/** Servlet that returns some example content.*/
@WebServlet("/data")
public class DataServlet extends HttpServlet {
  
  private DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
  private final String COMMENT = "Comment";

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Query query = new Query(COMMENT).addSort("timestamp", SortDirection.DESCENDING);
    List<List<String>> comments = new ArrayList<List<String>>();
    PreparedQuery results = datastore.prepare(query);
    for (Entity entity : results.asIterable()) {
        List<String> currentInfo = new ArrayList<>();
        String comment = (String) entity.getProperty("comment");
        String image = (String) entity.getProperty("image");
        String name = (String) entity.getProperty("name");
        currentInfo.add(comment);
        currentInfo.add(image); 
        currentInfo.add(name);
        comments.add(currentInfo);
    }
    Gson gson = new Gson();
    response.setContentType("application/json");
    response.getWriter().println(gson.toJson(comments));
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String newComment = request.getParameter("comment");
    String profile = request.getParameter("profile");
    String[] attributes;
    if (profile != null) {
      attributes = profile.split(" ");
    }
    else {
      attributes = new String[]{"Anonymous", "", "/images/blank.png", ""};
    }
    long timestamp = System.currentTimeMillis();
    Entity commentEntity = new Entity(COMMENT);
    commentEntity.setProperty("comment", newComment);
    commentEntity.setProperty("timestamp", timestamp);
    commentEntity.setProperty("name", attributes[0]+" "+attributes[1]);
    commentEntity.setProperty("image", attributes[2]);
    datastore.put(commentEntity);
    response.sendRedirect("/contact.html");
  }
}
