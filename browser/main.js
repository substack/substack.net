var classList = require('class-list');

var avatar = document.getElementById('avatar');
avatar.addEventListener('mouseover', function (ev) {
    avatar.setAttribute('src', '/images/substack_angry.png');
});
avatar.addEventListener('mouseout', function (ev) {
    avatar.setAttribute('src', '/images/substack.png');
});

var summarized = document.querySelectorAll('#root .article.summary');
for (var i = 0; i < summarized.length; i++) {
console.log('i=' + i);
    summarized[i].addEventListener('click', function onclick (ev) {
console.log('CLICK');
        ev.preventDefault();
        this.removeEventListener('click', onclick);
        classList(this).remove('summary');
    });
}

var moreArticles = document.querySelector('#root .more');
if (moreArticles) {
    
}

var art = document.querySelector('#art');
if (art) require('./art.js')().appendTo(art);
