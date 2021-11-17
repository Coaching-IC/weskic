<template>
  <div>
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

    <h2 class="title questionsSectionTitle">Administratif</h2>

    <InfoQuestion class="question" question="Comment fonctionne la réservation ?">
      <p>La réservation complète se fait en plusieurs étape, tout se passera sur ce site.
        En cas de <strong>problème de santé nécessitant une attention particulière</strong> vous pourrez
        contacter notre Supercoach Paul Madelénat qui sera le responsable sécurité pour le WESKIC
        (+ secouriste EPFL). <br>Voici les différentes étapes : </p>
      <ul style="list-style: decimal;">
        <li><strong>"ÉTAPE 0" - Connexion avec Tequila</strong>
          <p>Vérification de la date d'inscription. Une fois connecté ta place est
            garantie pendent une heure jusqu'à ce que tu termines l'étape suivante.</p></li>
        <li><strong>ÉTAPE 1 - Informations personnelles</strong>
          <p>C'est ici que tu préciseras si tu as des allergies, des contraintes alimentaires ou des remarques.
            On te demandera aussi un contact d'urgence, de signer une décharge et de fournir deux documents indispensables :
            une <strong>pièce d'identité</strong> et ta <strong>carte d'assurance</strong>.</p></li>
        <li><strong>ÉTAPE 2 - Paiement</strong>
          <p>On propose deux méthodes de paiement. Soit <strong>en ligne</strong> avec une carte de crédit ou TWINT,
            soit à la Boutique AGEPoly <strong>en cash</strong>.<br><strong>Attention: vous avez 5 jours pour
              effectuer votre paiement à compter de votre première connexion Tequila. Votre place n'est plus
              garantie après ce délai.</strong></p></li>
        <li><strong>ÉTAPE 3 - Matériel et compléments</strong>
          <p>À partir de cette étape il faut attendre février. On vous donnera plus d'informations pour la location (facultative et à votre charge) de matériel de ski.</p></li>
        <li><strong>ÉTAPE 4 - Placement dans les chambres</strong>
          <p>Tu pourras choisir ta chambre librement sur le site de réservation.
            Les chambres ne seront pas mixtes et les noms des occupants ne seront pas affichés.
            Pour rejoindre tes amis il te suffira de repérer le numéro de chambre.</p></li>
      </ul>
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

.questionsSectionTitle {
  color: white;
  text-shadow: 2px 2px #128ab2;
  margin-top: 20px;
}

.question {
  margin-bottom: 5px;
}

</style>
