var questions = $('.question');

function createQuestion (n) {
    var qn = $(questions[n]);
    qn.hide();
    qn.submit(function (ev) {
        ev.preventDefault();
        var theirAnswer = parseInt(qn.find('.answer').val());
        console.log("Their answer:" + theirAnswer);
        var rightAnswer = eval(qn.find('.q').text());
        console.log("The right answer is: "+rightAnswer);
        if (theirAnswer === rightAnswer){
            qn.hide();
            if (n === questions.length - 1) {
                alert('All correct!');
            }
            else {
                $(questions[n+1]).show();
            }
        }else{
            alert("Try again!");
        }
    });
}

// loop over the questions from 0 through n, inclusive
for (var i = 0; i < questions.length; i++) {
    createQuestion(i);
}

$(questions[0]).show();
