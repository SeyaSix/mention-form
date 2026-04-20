document.getElementById('mentionsForm').addEventListener('submit', function (e) {
    e.preventDefault();
    generatePDF();
});

document.getElementById('resetBtn').addEventListener('click', function () {
    document.getElementById('mentionsForm').reset();
});

function getVal(id) {
    return document.getElementById(id).value.trim();
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const data = {
        nomSociete:          getVal('nomSociete'),
        siret:               getVal('siret'),
        nomResponsables:     getVal('nomResponsables'),
        editeurPublication:  getVal('editeurPublication'),
        directeurPublication:getVal('directeurPublication'),
        responsableRedaction:getVal('responsableRedaction'),
        hebergeur:           getVal('hebergeur'),
    };

    // ── Couleurs ──
    const bleu   = [0, 51, 105];      // #003369
    const dark   = [16, 18, 24];      // #101218
    const light  = [233, 238, 246];   // #e9eef6
    const gris   = [110, 120, 140];

    const pageW = 210;
    const pageH = 297;
    const marginL = 20;
    const marginR = 20;
    const contentW = pageW - marginL - marginR;

    // ── Fond de page ──
    doc.setFillColor(...dark);
    doc.rect(0, 0, pageW, pageH, 'F');

    // ── Bandeau titre ──
    doc.setFillColor(...bleu);
    doc.rect(0, 0, pageW, 38, 'F');

    doc.setTextColor(...light);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('MENTIONS LÉGALES', marginL, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(180, 200, 230);
    doc.text(data.nomSociete, marginL, 25);

    const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.setFontSize(9);
    doc.setTextColor(150, 175, 210);
    doc.text(`Généré le ${today}`, marginL, 33);

    // ── Ligne de séparation sous le bandeau ──
    doc.setDrawColor(...bleu);
    doc.setLineWidth(0.8);
    doc.line(marginL, 42, pageW - marginR, 42);

    // ── Sections ──
    let y = 52;

    const sections = [
        {
            title: 'INFORMATIONS GÉNÉRALES',
            fields: [
                { label: 'Nom de la société',    value: data.nomSociete },
                { label: 'Numéro de SIRET',      value: data.siret },
                { label: 'Nom des responsables', value: data.nomResponsables },
            ],
        },
        {
            title: 'PUBLICATION',
            fields: [
                { label: 'Éditeur de la publication',      value: data.editeurPublication },
                { label: 'Directeur de la publication',    value: data.directeurPublication },
                { label: 'Responsable de la rédaction',    value: data.responsableRedaction },
            ],
        },
        {
            title: 'HÉBERGEMENT',
            fields: [
                { label: 'Hébergeur', value: data.hebergeur },
            ],
        },
    ];

    sections.forEach((section) => {
        // Titre de section
        doc.setFillColor(...bleu);
        doc.roundedRect(marginL, y, contentW, 9, 2, 2, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...light);
        doc.text(section.title, marginL + 4, y + 6.2);

        y += 14;

        section.fields.forEach((field) => {
            // Fond de ligne alternée légèrement visible
            doc.setFillColor(24, 28, 38);
            doc.rect(marginL, y - 1, contentW, 11, 'F');

            // Label
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(...gris);
            doc.text(field.label.toUpperCase(), marginL + 3, y + 5);

            // Valeur
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...light);
            const labelWidth = doc.getTextWidth(field.label.toUpperCase() + '  ');
            doc.text(field.value || '—', marginL + 3 + 58, y + 5.2);

            y += 13;
        });

        y += 6;
    });

    // ── Pied de page ──
    doc.setDrawColor(...bleu);
    doc.setLineWidth(0.5);
    doc.line(marginL, pageH - 16, pageW - marginR, pageH - 16);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...gris);
    doc.text(
        `Document généré automatiquement — ${data.nomSociete}`,
        pageW / 2,
        pageH - 10,
        { align: 'center' }
    );

    // ── Sauvegarde ──
    const filename = `mentions-legales-${sanitize(data.nomSociete)}.pdf`;
    doc.save(filename);

    showToast('PDF généré avec succès !');
}

function sanitize(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/gi, '-')
        .toLowerCase()
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
