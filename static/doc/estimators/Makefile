all: pdf code

clean:
	rm -f code

code:
	ghc --make report.lhs -o code

pdf:
	lhs2TeX report.lhs -o report.tex --verb && \
    pdflatex report && \
    bibtex report && \
    pdflatex report && \
    pdflatex report

show:
	evince report.pdf
