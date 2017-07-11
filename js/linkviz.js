var linkSets = [];

window.onload = onLoad;

function onLoad()
{
    $.when(parseData()).done(function()
    {
        var trs = d3.select(".linklist")
            .selectAll("div")
            .data(linkSets)
            .enter()
            .append("div")
            .attr("class", "linkset-line")
            .attr("id", function(d) { return "line-" + d.name; })
            .append("div")
            .attr("class", "columns")
            .on("click", function(d) {

                d3.selectAll(".viz").remove();


      
                var viz = d3.select("#line-" + d.name)
                .append("div")
                .attr("class", "viz")
                .style("max-height", "0px")
                .style("opacity", "0");

                var vizColumns = viz.append("div")
                    .attr("class", "columns")
                    .style("padding-bottom", "30px");

                var diagramColumn = vizColumns.append("div")
                    .attr("class", "column is-half")
                    .append("div")
                    .attr("class", "box")
                    .style("padding", "30px");

                var barsHeader = diagramColumn.append("div")
                    .style("font-weight", "500")
                    .style("padding-bottom", "10px")
                    .attr("class", "columns");

                barsHeader.append("div")
                    .attr("class", "column is-3")
                    .text("Versions");

                barsHeader.append("div")
                    .attr("class", "column")
                    .style("padding-left", "0px")
                    .text("#Links");

                var diagramBox = diagramColumn.append("div")
                    .attr("class", "chart");

                var bars = diagramBox.selectAll("div")
                    .data(d.revisions)
                    .enter()
                    .append("div")
                    .style("height", "35px")
                    .attr("class", "columns");

                bars.append("div")
                    .attr("class", "bar-label column is-3")
                    .text(function(d) { return d.date });

                bars.append("div")
                    .attr("class", "bar is-info hero")
                    .style("min-width", "26px")
                    .style("width", "0px")
                    .text(function(d) { return d.count; });
                    


                var infoBox = vizColumns.append("div")
                    .attr("class", "column is-half")
                    .append("div")
                    .attr("class", "box");
                
                infoBox.append("div")
                    .text(function(d) { return "Linkset: " + d.name; });
                infoBox.append("div")
                    .text(function(d) { return "Current Version: " + d.revisions[d.revisions.length - 1].date; });
                infoBox.append("div")
                    .text(function(d) { return "Number of links in current version: " + d.current; });
                infoBox.append("div")
                    .text(function(d) { return "Number of links in previous version: " + d.previous; });


                viz.transition()
                    .style("max-height", "1000px")
                    .on("end", function(d)
                    {
                         d3.select(".viz")
                            .transition()
                            .style("opacity", "1");

                        var chart = d3.select(".chart")

                        chart.selectAll(".bar")
                            .transition()
                            .style("width", function(d) { return Math.max(2, Math.floor(60 * d.count / d.max)) + "%" })

                    })

        });


        

        var nameDivs = trs.append("div")
            .attr("class", "column is-half")
            .text(function(d) { return d.name; });

        trs.append("div")
            .attr("class", "column")
            .text(function(d) { return d.revisions[d.revisions.length - 1].count; });

        trs.append("div")
            .attr("class", "column")
            .text(function(d) { return d.revisions[d.revisions.length - 2].count; });

        trs.append("div")
            .attr("class", "column")
            .text(function(d) { return d.average; });


        var issueDiv =  trs.append("div")
            .attr("class", "column");

        issueDiv.filter(function(d) { return d.current < d.average })
            .append("span")
            .attr("class", "icon has-text-danger")
            .append("i")
            .attr("class", "fa fa-warning tooltip")
            .append("div")
            .attr("class", "tooltiptext")
            .text("Number of links smaller than average!");

        issueDiv.filter(function(d){ return d.current < d.previous })
            .append("span")
            .attr("class", "icon has-text-warning")
            .append("i")
            .attr("class", "fa fa-warning tooltip")
            .append("div")
            .attr("class", "tooltiptext")
            .text("Number of links smaller than previous set!");

        issueDiv.filter(function(d){ return d.current == d.previous && d.current == d.preprevious })
            .append("span")
            .attr("class", "icon has-text-warning")
            .append("i")
            .attr("class", "fa fa-warning tooltip")
            .append("div")
            .attr("class", "tooltiptext")
            .text("Number of links stagnant over last 3 sets!");

        


    });
}

function parseData(file)
{
	return $.ajax({
        url: "data/dbpedia-count-links_bydataset.txt",
        async: true,
        success: function (data){

            var lines = data.split("\n"); 

            var currentSet = null;

            for(var i = 0; i < lines.length; i++)
            {
                var entries = lines[i].split("\t");

                if(currentSet == null || entries[0] != currentSet.name)
                {
                    if(currentSet != null)
                    {
                        for(var j = 0; j < currentSet.revisions.length; j++)
                        {
                            currentSet.average += currentSet.revisions[j].count;

                            if(currentSet.revisions[j].count > currentSet.max)
                            {
                                currentSet.max = currentSet.revisions[j].count;
                            }
                        }

                        for(var j = 0; j < currentSet.revisions.length; j++)
                        {
                            currentSet.revisions[j].max = currentSet.max;
                        }

                        currentSet.average /= currentSet.revisions.length;
                        currentSet.average = Math.round(currentSet.average);
                    }

                    currentSet = { name : entries[0], revisions : [], average : 0, current : 0, previous : 0, preprevious : 0, max : 0 }

                    linkSets.push(currentSet);
                }

                currentSet.revisions.push({ date : entries[1], count : parseInt(entries[2]), max : 0 })
                currentSet.preprevious = currentSet.previous;
                currentSet.previous = currentSet.current;
                currentSet.current = parseInt(entries[2]);
            }
        },
        error: function(data) {
            alert("HEYO");
        }
    });
}
