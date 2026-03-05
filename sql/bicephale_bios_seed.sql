-- Creates a first-class bios table in Supabase and seeds it from data/team.json.
-- Safe to run multiple times: it upserts by slug.

begin;

create extension if not exists pgcrypto;

create table if not exists public.bicephale_bios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  role text,
  rank integer not null,
  portrait_base text,
  bio jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bicephale_bios_bio_is_array check (jsonb_typeof(bio) = 'array')
);

create index if not exists bicephale_bios_rank_idx on public.bicephale_bios(rank);

alter table public.bicephale_bios enable row level security;

-- Public read access for bios page.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'bicephale_bios'
      and policyname = 'Public read bios'
  ) then
    create policy "Public read bios"
      on public.bicephale_bios
      for select
      to public
      using (true);
  end if;
end
$$;

-- Authenticated editors can manage bios.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'bicephale_bios'
      and policyname = 'Editors manage bios'
  ) then
    create policy "Editors manage bios"
      on public.bicephale_bios
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end
$$;

insert into public.bicephale_bios (slug, name, role, rank, portrait_base, bio)
values
  ('jean-louis-poitevin', 'Jean-Louis Poitevin', NULL, 1, NULL, '["Docteur en philosophie (maîtrise sous la direction de Michel Serres, thèse sur le \"Sens et fonction de la notion de principe dans l’œuvre de Robert Musil\", sous la direction de Jacques Bouveresse), il est l’auteur de nombreux livres et essais sur l’art contemporain. Il fut aussi bien chargé de cours en esthétique et art contemporain rattaché aux universités de Paris VIII Saint Denis, de Boulogne-sur-Mer et de Marne-la-Vallée, qu’attaché culturel en Allemagne et en Autriche où il a dirigé les instituts français de Stuttgart et d’Innsbruck de 1998 à 2004, rédacteur de la revue Kanal Magazine, et fondateur de la revue TK-21. Membre de l’AICA (Association internationale des critiques d’art), il mène depuis plus de 20 ans une pratique d’écriture et de critique d’art en étant l’auteur de nombreuses préfaces, romans, essais et textes pour des artistes. Il participe aussi à de nombreux ouvrages collectifs et des catalogues d’exposition et donne des conférences en France et à l’étranger sur tous les sujets relatifs à l’histoire et à l’anthropologie des images."]'::jsonb),
  ('zohreh-deldadeh', 'Zohreh Deldadeh', NULL, 2, 'zohreh-deldadeh', '["Zohreh Deldadeh est une curatrice et chercheuse internationale en art basée à Téhéran et active en France et en Allemagne. Elle a collaboré avec de nombreuses galeries d''art, festivals, fondations et institutions, tant en Iran qu''à l''international, notamment la Galerie Dastan (Iran), la Fondation Pejman (Iran), le Musée d''Art Moderne de Paris (MAM) (France), le Festival de la Photo de Lodz (Pologne), la Plateforme Parallèle (Portugal, Pologne) et l''Institut Khoj (Inde), Poush (Paris).", "Dans sa pratique curatoriale, elle se concentre principalement sur les questions sociales et politiques. Sa passion pour les documents d''archives et les collections l''a conduite à s''intéresser à ses projets actuels."]'::jsonb),
  ('lexus-romet', 'Lexus Romet', NULL, 3, 'lexus-romet', '["Lexus est un.e poète et drag queer non-binaire originaire de Reims mêlant travail versifié et travail en prose, dans un univers performatif et subversif. Le maquillage est une arme, et les gestes qui accompagnent la voix participent à la machine de guerre et mettent du corps aux mots. Tout n’est pas que politique, c’est une poésie qui se veut avant tout divertissante, imagée et contemplative."]'::jsonb),
  ('kenza-sand', 'Kenza Sand', NULL, 4, NULL, '["Kenza Sand tisse une œuvre de poésie vivante née de sa pratique pluridimensionnelle du corps, de la parole, des arts visuels et des ondes qui les unissent. Elle est poète, autrice-compositrice-interprète, performeuse, vidéaste et plasticienne. Dans sa recherche et sa création polymorphe, elle explore les tonalités étranges de la nature humaine."]'::jsonb),
  ('eduardo-gonzalez', 'Eduardo Gonzalez Ortiz', NULL, 5, 'eduardo', '["Originaire de México, Eduardo Gonzalez Ortiz habite l’espace entre l''ingénierie et l’art. Après des études en Ingénierie, Philosophie et Cinéma entre México et Paris, il se situe à l’intersection du numérique et de l’image, où il poursuit le dialogue entre technologie et cinéma."]'::jsonb),
  ('maria-sofia-vacaflor', 'Maria Sofia Vacaflor', NULL, 6, 'maria-sofia-vacaflor', '["Née à 3600 mètres au-dessus du niveau de la mer à La Paz, en Bolivie, Maria Sofia Vacaflor est poétesse. Depuis quelques années, elle déclame ses textes lors de soirées poétiques dans des bars littéraires, des galeries d’art ou en festival. Elle explore le lien entre son univers poétique et la musique électronique, créant des performances d''électropoésie. Son premier recueil bilingue _Que no me falten las palabras / Que les mots ne me manquent pas_ est paru en 2024."]'::jsonb),
  ('anapa-berthias', 'Anapa Berthias', NULL, 7, 'anapa', '["Anapa Berthias rejoint BIC peu après sa rencontre avec ses fondateurs Marie et Kenzy, avant d''endosser le rôle de président en 2025. Né en 1994 en Polynésie française, au croisement d''origines hakka et loirétaines, il fait l''expérience de multiples destinations au cours de sa vie : Moselle, Toscane, Oise, Charentes, Équateur, Pays Nantais.", "Poussé par son imaginaire, sa première vocation sera celle de dessinateur et scénariste, avant de devenir successivement volontaire de solidarité internationale, hôtelier, puis agent de greffe. Le fruit de ces expériences cumulées lui donne l''opportunité de rejoindre le Quai d''Orsay en 2022, date à laquelle il déménage pour la première fois à Paris.", "Anapa Berthias est aujourd''hui rédacteur et gestionnaire public au service du réseau culturel français à l''étranger. Attaché aux questions d''identités croisées, de patrimoine culturel et d''héritages immatériels, il contribue aux productions Bicéphales en parallèle d''un apprentissage continuel sur le monde des affaires publiques, des relations internationales et des échanges culturels."]'::jsonb),
  ('steeve-minder', 'Steeve Minder', NULL, 8, 'steeve', '["Steeve Minder commence très tôt dans l’Art en apprenant le dessin (trait puis aquarelle), puis la musique (trompette et chant). Après douze ans d''Harmonie, il se consacre au théâtre en y associant la danse.", "Touche-à-tout par amour de l’Art, l’écriture le gagne. La fièvre créatrice n’attend pas et par extension : la poésie. Ses inspirations sont partout, surtout en mouvement. Elles s’éternisent dans les romantismes allemand et français, ainsi que le début du 20e siècle. Musicalement il se spécialise par passion dans la vieille chanson française, véritable charpente de la musique actuelle, et source infatigable d''inspiration!", "Il continue toutefois la musique à l’Orchestre Symphonique de Nanterre, et à se produire sur scène notamment dans _Votre Dévoué Maurice Ravel (2025)_ à l’occasion des 150 ans du Maître. Sans émotion à traduire, il n’est aucun baiser à donner. Ses deux premiers recueils _L’Antichambre_ (2022) et _D’un mec l’autre_ (2024) publiés aux _Éditions du Panthéon_ reposent sur la traduction de l’instant présent, illustrent le temps par la rencontre ; l’amour ; convertissent l''émotion des notes, du rythme en vers, et essayent de ne pas trouver la solution à tout afin de continuer à vivre.", "Paradoxal dans l’âme, il écrit sous le pseudonyme _Minder & Dubessy._ « Créer pour respirer, continuer pour survivre! »"]'::jsonb),
  ('wilfried-boyer', 'Wilfried Boyer', NULL, 9, 'wilfried', '["Titulaire d’une formation en histoire et en relations internationales, Wilfried Boyer a eu l’opportunité de travailler en relation avec les publics dans le domaine muséal, notamment au musée Polenovo en Russie ainsi qu’au Musée des Arts décoratifs de Paris, expériences qui ont nourri sa passion profonde pour la culture sous toutes ses formes et son rayonnement vers tous les publics.", "Acteur expérimenté en médiation interculturelle, il a participé au dispositif “les jeunes ont la parole” du musée du Louvre, au programme “Join Hands”. C’est tout naturellement qu’il a embarqué en médiation dès le début de l’association BIC sur le projet “Ex-tension des frontières”."]'::jsonb),
  ('pauline-levy', 'Pauline Levy', NULL, 10, 'pauline', '["Designer graphique spécialisée en édition, typographie et identité visuelle, Pauline Levy affectionne particulièrement les objets graphiques imprimés. Animée par le mouvement et l''espace, elle les perçoit comme une surface d’expérimentation où caractères typographiques et images viennent composer ensemble.", "Elle a notamment participé à la création du zine _Débris 3_ , faisant dialoguer les créations plastiques de trente-six artistes confirmé•es et amateur•es. Elle a également travaillé auprès de la Mboata, Le Nouveau Printemps, le Frequency, les Amarres et la compagnie des Petites Fictions.", "Par la suite, elle remplace l’ordinateur par la perceuse et étend sa pratique à la scénographie, alternant entre tournages, plateaux scéniques et festivals. Son envie d’occuper l’espace passe également par la danse, qu’elle apprécie comme moyen d’expression individuel et collectif venant questionner le rapport à l’autre, au groupe et à l’espace public. Par ces temps sombres, valoriser la culture de par son art devient pour elle un acte nécessaire et militant."]'::jsonb),
  ('marie-barbuscia', 'Marie Barbuscia', NULL, 11, 'marie', '["Née en 1992, Marie Barbuscia, est diplômée d’un master en histoire de l’art à l’Université Paris IV Sorbonne, axé sociologie de l’art. Dans ses recherches, elle a convoqué l’idée d’une « fabrication de notoriété » au sujet des femmes artistes de passage du XIXe s. (Sarah Bernhardt, Louise Abbéma).", "Depuis 2018, elle est critique d’art et autrice dans différentes revues (Boombang, TK21, Affixe, Eurydice...) et care-actrice de plusieurs expositions : _Ex-tension des frontières_ (2020, Pas si Loin, Pantin), _Temps de Jou(i)r_ (Galerie Nocte, 2024).", "Comme exprimé dans son séminaire sur “ _l''œil supplicié”_ à la Galerie Hors-Champs, sa démarche entend décortiquer les images et les signes pour en montrer « l’authentiquement politique » profondément enfouis en chacune d’entre elles. Elle définit le rôle du curator comme relevant d’un « care-actor ».", "Elle est également membre de l’Association internationale des Critiques d’arts (AICA). En tant que chargée de projets culturels, Marie Barbuscia a pris soin d''accompagner des expositions avec différents collectifs : _Et vous, vous y croyez aux fantômes?_ (collectif fantomachie, 2018) et plus récemment _TECH CARE_ en curation partagée avec Vincent Moncho et l’association Brigade d’Interventions Contributives (B.I.C), qui fut la première exposition nationale à rendre ouvertement hommage à la pensée de Bernard Stiegler (Galerie 6B, Ile Saint-Denis, 2024).", "Elle contribue aux soirées Bicéphales et à la revue Bicéphale."]'::jsonb),
  ('pierre-mengelle', 'Pierre Mengelle', NULL, 12, 'pierre', '["Après des études d''ingénieur, Pierre Mengelle travaille quelques années dans le monde de la tech, avant de bifurquer vers la scénographie en 2019. En 2021, il décide de compléter son cursus par un master spécialisé à l''ENSCI-Les Ateliers à Paris.", "Depuis, il imagine, dessine, conçoit et construit des décors de théâtres, de tournages et de performances artistiques, notamment pour les troupes _Nuit Orange_ , _Les Pies Menteurs_ et _Robin Production_.", "Il s''est également impliqué dans le monde de la musique électronique et de la fête, en fondant le collectif _Fausse Sceptique_ qui organise des soirées en île-de-France depuis 6 ans et pour lequel il est DJ sous le pseudonyme _DJ Jetable_."]'::jsonb),
  ('irina-zimmerman', 'Irina Maria Zimmerman', NULL, 13, 'irina', '["Irina Maria Zimmerman est écrivaine et traductrice. Elle est née à Bucarest et vit aujourd''hui à Paris où elle est en train de finir son premier roman. Pour les soirées bicéphales, elle crée des performances de poésie gymnastique autour de ses textes."]'::jsonb),
  ('kenzy-boukhtouche', 'Kenzy Boukhtouche', NULL, 14, 'kenzy', '["Kenzy Boukhtouche est co-fondateur de l’association Brigade d’Interventions Contributives (B.I.C) et trésorier. Passionné par les enjeux de société, il s’est d’abord engagé dans la sphère de l’antiracisme.", "Avec Bicéphale, Il cherche à rendre l’art accessible et compréhensible par tous, en transformant des enjeux complexes en expériences sensibles. Diplômé d’un Master en Science politique et en droit à la Sorbonne, il met sa curiosité au service de projets publics d’envergure.", "Parallèlement, il se consacre au théâtre et au cinéma, il était à l’affiche du film _Outside Francisque_ (2023). Ces expériences nourrissent sa vision autour du dialogue comme pratique performative. Il anime les soirées Bicéphale, transformant ces rendez-vous en laboratoires d’expérimentation où textes, images et voix contemporaines dialoguent.", "Aujourd’hui, il poursuit ce chemin à la croisée des mondes institutionnels et artistiques, inventant collectivement avec Bicéphale des espaces de dialogue, d’exploration et de réinvention collective."]'::jsonb),
  ('oona-doyle', 'Oona Doyle', NULL, 15, 'oona', '["Oona Doyle est curatrice et poète basée à Paris. Diplômée du Goldsmiths College de Londres, elle développe une pratique à la croisée de la poésie et de l’exposition. Ses poèmes sont à la fois réalistes et fantasmagoriques. Elle cherche à capter la spécificité du monde contemporain, marqué par le techno-capitalisme.", "Selon elle, la poésie est un acte libérateur, capable de transformer un réel imposé. Elle a notamment créé une série de poèmes qui fonctionnent comme des « micro-expositions ». Dans chaque poème, les mots sont connectés à une œuvre d’art.", "Sa recherche en histoire de l’art s’ancre dans une approche anthropologique, explorant les croisements entre folklore et internet, notamment en Europe de l’Est.", "En 2022, elle a conçu l’exposition _Saturation_ , réunissant des peintres contemporaines abstraites autour des notions d’intensité, de trop-plein et de surcharge émotionnelle. En 2024, elle a été commissaire de l’exposition _Ré-enchantement_ , rassemblant des artistes qui projettent des visions oniriques et collaborent avec le vivant, afin d''infuser la matière de symboles, d’histoires, de vie. En 2025, elle présente _Le Soi ombre_ , une exposition personnelle consacrée à Teresa Pągowska, figure de l’avant-garde polonaise, connue pour sa représentation sans parallèle de la figure féminine et son utilisation radicale de la toile brute comme élément pictural."]'::jsonb),
  ('adrien-marie-hardy', 'Adrien Marie-Hardy', NULL, 16, 'adrien', '["Né en 1993, diplômé d’un DNSEP à la Haute École des Arts du Rhin, Adrien Marie-Hardy développe une peinture où l’inquiétante étrangeté déforme le réel et révèle son soubassement chaotique. Influencé par Zdzisław Beksiński, Phil Hale, H.R. Giger et profondément marqué par l’univers de Werner Herzog, il voit dans le chaos non pas une menace mais une matrice : une force primordiale, poétique et féconde, bien plus vaste que toute vie déterminée par les dogmes humains.", "Marqué par le cinéma de genre et d’horreur, il puise dans l’absurde ordinaire la matière d’images où l’ordre apparent se fissure et laisse affleurer un monde libre, affranchi des carcans religieux et sociaux.", "En parallèle, Adrien a fondé et dirigé la galerie Nocte pendant deux ans, en y assumant le commissariat et la scénographie des expositions. Ce lieu nocturne mêlant expositions, concerts et performances traduisait sa vision d’un art instable et vivant, où le désordre formel et spatial devenait moteur de poésie et de liberté.", "Refusant toute présentation figée, il conçoit ses expositions comme des expériences totales, des terrains d’instabilité où le chaos, loin d’être destructeur, devient un principe créatif et une invitation à repenser la place de l’homme dans un monde non déterminé."]'::jsonb),
  ('francisco-del-ryo', 'Francisco Del Ryo', NULL, 17, 'francisco-del-ryo', '["Storyteller dans l’âme depuis toujours et né en 1997, Francisco est vidéaste, scénariste et réalisateur. Après des études littéraires en Humanités à l’Université Paris-Nanterre et une formation de réalisateur-monteur à l’école de cinéma EMC, il se lance comme vidéaste indépendant en 2022.", "En 2023, son premier long-métrage « Outside Francisque » a été présenté dans une dizaine de festivals internationaux remportant plusieurs prix parmi lesquels celui de meilleur scénariste à l’AltFF Film Festival.", "Entre plusieurs collaborations de vidéastes pour l’association BIC et projets de fiction, Francisco monte des films institutionnels pour de grandes entreprises."]'::jsonb),
  ('lucie-babin', 'Lucie Babin', NULL, 18, 'lucie', '["Diplômée d’un master en médiation culturelle, Lucie – alias _Velvet Fire_ – défend l’expression artistique comme un acte vital, une respiration nécessaire dans un monde en déséquilibre. Ses ateliers, pensés avec des matériaux éco-conçus, ouvrent des espaces de création accessibles à tous.", "Dans sa pratique personnelle, elle redonne des lettres de noblesse à l''oubli : objets trouvés, fragments de mémoire, matières délaissées. Autodidacte passionnée, elle compose un cabinet de curiosités contemporain où se mêlent collages, sculptures, volumes et délicates pièces en papier.", "Ses œuvres, entre fragile et monumental, questionnent l’identité, le souvenir, l’environnement et ce qui nous relie. À travers ses créations, Lucie invite à voir dans chaque rébus une promesse de renaissance."]'::jsonb)
on conflict (slug) do update
set
  name = excluded.name,
  role = excluded.role,
  rank = excluded.rank,
  portrait_base = excluded.portrait_base,
  bio = excluded.bio,
  updated_at = now();

commit;
