<template>
  <div>
    <h2 class="title questionsSectionTitle">Administratif</h2>

    <InfoQuestion class="question" question="Comment fonctionne la réservation ? Quelles sont les options ?" important="true">
      <p>La réservation complète se fait en plusieurs étape, tout se passera sur ce site.
        En cas de <strong>problème de santé nécessitant une attention particulière</strong> vous pourrez
        contacter notre Supercoach Paul Madelénat qui sera le responsable sécurité pour le WESKIC. <br>Voici les différentes étapes : </p>
      <ul style="list-style: decimal;">
        <li><strong>"ÉTAPE 0" - Connexion avec Tequila</strong>
          <p>Vérification de la date d'inscription. Une fois connecté ta place est
            garantie pendent une heure jusqu'à ce que tu termines l'étape suivante.<br>
            Si toutes les places sont prises tu seras ajouté à une liste d'attente et tu seras contacté par Telegram pour compléter ton inscription.</p></li>
        <li><strong>ÉTAPE 1 - Informations personnelles</strong>
          <p>C'est ici que tu préciseras si tu as des allergies, des contraintes alimentaires ou des remarques.
            On te demandera aussi un contact d'urgence, de signer une décharge, de rejoindre un channel Telegram, et de fournir deux documents indispensables :
            une <strong>pièce d'identité</strong> et ta <strong>carte d'assurance</strong>.</p></li>
        <li><strong>ÉTAPE 2 - Paiement</strong>
          <p>Vous pouvez payez par deux moyens : soit directement sur ce site (PostFinance), soit en passant à la boutique AGEPoly (Cash, TWINT, Camipro)<br>
            Pour le prix regardez la question ci-dessous.<br>
            <strong>Attention: un délais vous sera indiqué. Une fois passé votre place n'est plus garantie.</strong></p></li>
        <li><strong>ÉTAPE 3 - Matériel et compléments</strong>
          <p>À partir de cette étape il faut attendre février. On vous donnera plus d'informations pour la location (facultative et à votre charge) de matériel de ski et snow.</p></li>
        <li><strong>ÉTAPE 4 - Placement dans les chambres</strong>
          <p>Tu pourras choisir ta chambre librement sur le site de réservation.
            Les chambres ne seront pas mixtes et les noms des occupants ne seront pas affichés.
            Pour rejoindre tes amis il te suffira de repérer le numéro de chambre.</p></li>
      </ul>
    </InfoQuestion>

    <InfoQuestion class="question" question="Comment signaler un problème, une plainte, ou émettre une demande pendant ou avant le WESKIC ?">
      <p>Nous avons ajouté un <a href="/help" target="_blank">formulaire d'aide destiné aux participants</a>. Une fois connecté vous avez accès
        à un bouton "J'ai besoin d'aide". Ce formulaire permet d'envoyer votre requête à la bonne personne.
        <br>Seul le comité du Coaching pourra voir ces messages. Si vous souhaitez davantage de discretion vous pouvez
        également contacter directement les 2 Supercoachs :
        <a href="mailto:hugues.devimeux@epfl.ch,paul.madelenat@epfl.ch">Hugues Devimeux et Paul Madelénat</a>.</p>
    </InfoQuestion>

    <InfoQuestion class="question" question="Qu'est-ce que le prix de base de CHF 135.- ? Qu'est-ce qui est compris ?">
      <div class="columns" style="">
        <div class="column">
          <img class="" src="../assets/price-graph.png"  alt=""/>
        </div>
        <div class="column">
          <h5 class="subtitle">Le prix de base</h5>
          <p>C'est le prix minimal du séjour tout compris. Ci-contre une illustration qui représente les
            parts qui composent ce prix. Le prix de base n'inclut pas deux options : le forfait de ski et l'éventuelle location de matériel.</p>

          <h5 class="subtitle">Forfait de ski</h5>
          <p>
            Tu n'es pas obligé de prendre un abonnement, il y d'autres activités possibles et tu es libre d'explorer la station.
            Pour ceux qui veulent l'abonnement vous avez plusieurs possibilités :
          </p>
          <ul>
            <li><p>Jour 1 - Vendredi : <strong>Espace Torgon</strong>, paiement sur ce site en même temps que le prix de base. Prix de groupe : 26.00 CHF</p></li>
            <li><p>Jour 2 - Samedi : <strong>Espace Liberté</strong>, simple sondage, paiement sur place. Ce domaine est bien
              plus grand et un peu plus cher. Si assez de personnes veulent skier le forfait de groupe
              sera aussi disponible pour ce jour. Sinon ce sera 39.00 CHF </p></li>
            <li><p>Jour 3 - Dimanche : simple sondage, paiement sur place. Attention : c'est le jour du départ donc si vous skiez vous rentrez <strong>par vos propres moyens</strong></p></li>
          </ul>


          <h5 class="subtitle">Location de matériel</h5>
          <p>Pour le matériel on vous expliquera tout d'ici février, en gros on gère la logistique pour vous même si c'est vôtre matériel.</p>
        </div>
      </div>
    </InfoQuestion>

    <h2 class="title questionsSectionTitle">Activités</h2>

    <InfoQuestion class="question" question="Est-ce que je suis obligé de skier ?">
      <p>Non tu n'es pas obligé de skier. Dans le formulaire d'inscription
        tu peux demander de ne pas prendre de forfait de ski. Tu devras quand
        même aller à la station le premier jour car personne ne sera au chalet.
        Tu peux y faire ce que tu veux bien entendu.</p>
    </InfoQuestion>

    <InfoQuestion class="question" question="Comment ça se passe pour le matériel de ski ?">
      <p>Deux possiblités : si tu as ton propre matériel
        tu pourras nous le confier pour le transport. Sinon en février tu pourras
        louer du matériel et on gère la logistique. Plus d'infos plus
        tard. Bien entendu tu peux aussi louer ton matériel autre part
        mais en général c'est moins avantageux.</p>
    </InfoQuestion>

    <InfoQuestion class="question" question="Est-ce que je dois savoir skier pour venir ?">
      <p>Même pas ! Notre incroyable Picsoucoach Maxime est également monitrice de ski. Elle organisera des cours gratuits pour débutants. Raison de plus de venir ;)</p>
    </InfoQuestion>

    <InfoQuestion class="question" question="... et pour le snow ?">
      <p>Nous ne proposerons pas de cours de snowboard mais si tu sais déjà en faire tu pourras en louer.</p>
    </InfoQuestion>

  </div>
</template>

<script>

import InfoQuestion from "@/components/InfoQuestion";

export default {
  name: 'QaA',
  components: {InfoQuestion},
  props: [],
  methods: {}
}
</script>

<style scoped>

h5.subtitle {
  margin-bottom: 5px;
}

.questionsSectionTitle {
  color: white;
  text-shadow: 2px 2px #128ab2;
  margin-top: 20px;
}

.question {
  margin-bottom: 5px;
}

</style>
