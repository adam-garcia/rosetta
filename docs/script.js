$( document ).ready(function() {
    /**
     * Nav Functionality
     */
    $("#nav a").click(function(e) {
        var href = $(this).attr("href");
        e.preventDefault();
        if (href == "#home") {
            $("html, body").animate({
                scrollTop: $("#app").offset().top - 50
            }, 'slow');
        } else if (href != "#") {
            $("html, body").animate({
                scrollTop: $(href).offset().top - 50
            }, 400);
        }
    });


    /**
     * Initialize Simple MD Editor
     */
    var simplemde = new SimpleMDE({ 
        element: $("#readme-edit")[0],
        autosave: true,
        spellChecker: false,
        placeholder: "Give a top-level desciption of your study here..."
    });

    window.simplemde = simplemde;

    /**
     * Project Title Interactivity
     */
    var projectTitle = "My Project Title <span>(Click to edit...)</span>";
    var defaultTitle = projectTitle;
    $("#project-title")
        .html(projectTitle)
        .promise().done(function() {
            projectTitle = "My Project Title";
        });
    $("h2[contenteditable]").on('blur keyup paste', function() {
        projectTitle = $(this).html() == defaultTitle ? "My Project Title" : $(this).text();
        if (simplemde.edited != true) {
            simplemde.value("# " + projectTitle);
        }
    });

    /**
     * Checklist
     */
    $("#checklist input[type='checkbox']").click(function(){
        $(this).next().toggleClass('strikethrough');
        nBoxes = $("#checklist input[type='checkbox']").length;
        nChecks = $("#checklist input[type='checkbox']:checked").length;
        if (nChecks == nBoxes) {
            $("#download a").removeClass('disallow');
        } else {
            $("#download a").addClass('disallow');
        };
    });
    $("#checklist span")
        .css("cursor", "pointer")
        .click(function() {
        $(this).prev().click();
    });


    /**
     * SimpleMDE Customization
     */
    $(".CodeMirror").click(function(){
        if (!$("#checklist input#todo-readme").is(':checked')) {
            $("#checklist input#todo-readme").click();
        };
        simplemde.edited = true;
    });

    /**
     * Study Design Options
     */
    $("#longitudinal-lvl").fadeOut();
    $("#longitudinal-yes").click(function() {
        $("#longitudinal-lvl").fadeIn();
        console.log('aaa');
    });
    $("#longitudinal-no").click(function() {
        $(this).addClass()
    });

    /**
     * Project Options Configuration
     */
    var modules = { "" : "" };
    $("#new-module span").on('click', function(e) {
        var module = $("#new-module input")
                            .val()
                            .replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter) {
                                return letter.toUpperCase();
                            })
                            .replace(/\s/g, "");
        if (module != "" && modules[module] == undefined) {
            modules[module] = module;
            $("<span>")
                .text(module)
                .attr("title", "Click to Remove")
                .addClass("data-component")
                .click(function() {
                    modules[module] = null;
                    $(this)
                        .fadeOut()
                        .promise()
                        .done(function(){
                            $(this).remove();
                        });
                })
                .appendTo($("#components-list"));
            $("#new-module input").val("");
            window.modules = modules;
        };
        if (!$("#checklist input#todo-modules").is(':checked')) {
            $("#checklist input#todo-modules").click();
        }
    });
    $("#new-module input").on('keyup', function(e) {
        if (e.keyCode==13) {$("#new-module span").click(); };
    });

    var logistics = { "" : "" };
    $("#new-logistic span").on('click', function(e) {
        var logistic = $("#new-logistic input")
                            .val()
                            .replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter) {
                                return letter.toUpperCase();
                            })
                            .replace(/\s/g, "");
        if (logistic != "" && logistics[logistic] == undefined) {
            logistics[logistic] = logistic;
            $("<span>")
                .text(logistic)
                .addClass("logistics-component")
                .attr("title", "Click to Remove")
                .click(function() {
                    logistics[logistic] = null;
                    $(this)
                        .fadeOut()
                        .promise()
                        .done(function(){
                            $(this).remove();
                        });
                })
                .appendTo($("#components-list"));
            $("#new-logistic input").val("");
            window.logistics = logistics;
        };
        if (!$("#checklist input#todo-logistics").is(':checked')) {
            $("#checklist input#todo-logistics").click();
        }
    });
    $("#new-logistic input").on('keyup', function(e) {
        if (e.keyCode==13) {$("#new-logistic span").click(); };
    });



    /**
     * File Download Specification
     */    
    var readme = {};
    $("#download a").click(function(event) {
        // Called when 'Download' Button Clicked
        if (!$(this).hasClass('disallow')) {
            download();
        } else {
            event.preventDefault();
        }
    });
    function download() {
        simplemde.togglePreview();
        projectFolder = projectTitle + ".zip";
        readme.md = simplemde.value();
        readme.html = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/skeleton/2.0.4/skeleton.css">' +
                      $(".editor-preview").first().html();
        readme.txt = readme.html.replace(/<(?:.|\n)*?>/gm, '');
        /**
         * Current Structure:
         *     ProjectTitle/
         *     ├── README.txt
         *     ├── README.md
         *     ├── README.html
         *     ├── AnalysisPlans/
         *     │   └── AimN/
         *     ├── SummaryReports/
         *     │   └── AudienceN/
         *     ├── Logistics/
         *     │   ├── (Budget)/
         *     │   └── (Personnel)/
         *     └── Data/
         *         └── Module_X/
         *             ├── Collection/
         *             │   └── TimeN/
         *             ├── Entry/
         *             │   └── TimeN/
         *             └── Programs/
         *                 └── TimeN/
         */
        var root = new JSZip();
        root.file("README.txt", readme.txt);
        root.file("README.md", readme.md);
        root.file("README.html", readme.html);

        var plan = root.folder("AnalysisPlans");
        plan.file("Aim_N/README.txt", "Describe the analysis aim here");
        plan.file("Aim_N/README.md", "# Describe the analysis aim here");
        plan.file("Aim_N/README.html", "<h1>Describe the analysis aim here</h1>");

        var reports = root.folder("Summary_Reports");
        reports.folder("Papers");
        reports.folder("Other");

        var data = root.folder("Data");
        $.map(modules, function(c){
            if (c != null && c != "") {
                var module = {};
                module.name = c;
                module.data = data.folder(c);
                module.data.folder("Collection");
                module.data.folder("Entry");
                module.data.folder("Programs");
            }
        });

        var implementation = root.folder("Logistics")
        $.map(logistics, function(l) {
            if (l != null && l != "") {
                implementation.folder(l);
            }
        });

        root.generateAsync({type: "blob"})
            .then(function(content) {
                saveAs(content, projectFolder)
            })
            .then(function() {
                simplemde.togglePreview();      
            });  
    };

});